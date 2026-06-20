/**
 * Memorization state (Module 6): per-ayah status/strength, manual marking,
 * scope aggregates, and page mastery. Local-first with sync to Supabase.
 */
import type { MemorizationStatus } from '@itqan/types';
import { getDb } from '../database';
import { enqueue } from './syncQueueRepo';
import {
  type Mark,
  masteryForAverage,
  nextReviewAt,
  nextStrength,
  statusForScore,
} from '../../features/hifz/scoring';

export interface MemState {
  ayahKey: string;
  surah: number;
  page: number;
  juz: number;
  status: MemorizationStatus;
  strengthScore: number;
  reviewCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}

export interface ScopeAggregate {
  averageStrength: number;
  totalAyahs: number;
  startedCount: number;
  weakCount: number;
  stableCount: number;
  lockedCount: number;
  masteryLevel: number;
}

interface RawMem {
  ayah_key: string;
  surah: number;
  page: number;
  juz: number;
  status: string;
  strength_score: number;
  review_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
}

const toState = (r: RawMem): MemState => ({
  ayahKey: r.ayah_key,
  surah: r.surah,
  page: r.page,
  juz: r.juz,
  status: r.status as MemorizationStatus,
  strengthScore: r.strength_score,
  reviewCount: r.review_count,
  lastReviewedAt: r.last_reviewed_at,
  nextReviewAt: r.next_review_at,
});

export async function getState(ayahKey: string): Promise<MemState | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<RawMem>(
    `SELECT * FROM memorization_states WHERE ayah_key = ?`,
    [ayahKey],
  );
  return row ? toState(row) : null;
}

/** Map of ayahKey -> state for a surah (only ayat that have a record). */
export async function getStatesForSurah(surah: number): Promise<Map<string, MemState>> {
  const db = await getDb();
  const rows = await db.getAllAsync<RawMem>(`SELECT * FROM memorization_states WHERE surah = ?`, [
    surah,
  ]);
  return new Map(rows.map((r) => [r.ayah_key, toState(r)]));
}

export interface AyahRef {
  key: string;
  surah: number;
  page: number;
  juz: number;
}

/** Apply a manual weak/good/strong mark and reschedule review (HIFZ-007). */
export async function markAyah(ayah: AyahRef, mark: Mark): Promise<MemState> {
  const db = await getDb();
  const existing = await getState(ayah.key);
  const reviewCount = existing?.reviewCount ?? 0;
  const score = nextStrength(existing?.strengthScore ?? 0, mark, reviewCount);
  const status = statusForScore(score);
  const now = new Date().toISOString();
  const next = nextReviewAt(score, now);

  await db.runAsync(
    `INSERT INTO memorization_states
       (ayah_key, surah, page, juz, status, strength_score, review_count, last_reviewed_at, next_review_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(ayah_key) DO UPDATE SET
       status = excluded.status,
       strength_score = excluded.strength_score,
       review_count = memorization_states.review_count + 1,
       last_reviewed_at = excluded.last_reviewed_at,
       next_review_at = excluded.next_review_at,
       updated_at = excluded.updated_at,
       synced = 0`,
    [ayah.key, ayah.surah, ayah.page, ayah.juz, status, score, reviewCount + 1, now, next, now],
  );

  await enqueue('memorization_state', 'upsert', ayah.key, {
    ayahKey: ayah.key,
    pageNumber: ayah.page,
    status,
    strengthScore: score,
    lastReviewedAt: now,
    nextReviewAt: next,
  });

  return (await getState(ayah.key))!;
}

/**
 * Mistake-weighted downgrade (MEM-010): a detected Tasmiʿ mistake pulls an ayah's
 * strength down and brings its review forward. Looks up page/juz from content.
 */
export async function weakenAyah(ayahKey: string): Promise<void> {
  const db = await getDb();
  const meta = await db.getFirstAsync<{ surah: number; page: number; juz: number }>(
    `SELECT surah, page, juz FROM ayahs WHERE key = ?`,
    [ayahKey],
  );
  if (!meta) return;
  const existing = await getState(ayahKey);
  const score = Math.min(existing?.strengthScore ?? 35, 35);
  const now = new Date().toISOString();
  const next = nextReviewAt(score, now);
  await db.runAsync(
    `INSERT INTO memorization_states
       (ayah_key, surah, page, juz, status, strength_score, review_count, mistake_count, last_reviewed_at, next_review_at, updated_at, synced)
     VALUES (?, ?, ?, ?, 'weak', ?, ?, 1, ?, ?, ?, 0)
     ON CONFLICT(ayah_key) DO UPDATE SET
       status = 'weak',
       strength_score = MIN(memorization_states.strength_score, 35),
       mistake_count = memorization_states.mistake_count + 1,
       next_review_at = excluded.next_review_at,
       updated_at = excluded.updated_at,
       synced = 0`,
    [ayahKey, meta.surah, meta.page, meta.juz, score, existing?.reviewCount ?? 0, now, next, now],
  );
}

type ScopeColumn = 'surah' | 'page' | 'juz';

async function aggregate(column: ScopeColumn, value: number): Promise<ScopeAggregate> {
  const db = await getDb();
  const totalRow = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM ayahs WHERE ${column} = ?`,
    [value],
  );
  const total = totalRow?.n ?? 0;

  const agg = await db.getFirstAsync<{
    sum: number;
    started: number;
    weak: number;
    stable: number;
    locked: number;
    approved: number;
  }>(
    `SELECT
        COALESCE(SUM(strength_score), 0) AS sum,
        COUNT(*) AS started,
        SUM(CASE WHEN status = 'weak' THEN 1 ELSE 0 END) AS weak,
        SUM(CASE WHEN status IN ('stable','locked','teacher_approved') THEN 1 ELSE 0 END) AS stable,
        SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) AS locked,
        SUM(CASE WHEN status = 'teacher_approved' THEN 1 ELSE 0 END) AS approved
       FROM memorization_states WHERE ${column} = ?`,
    [value],
  );

  const average = total > 0 ? Math.round((agg?.sum ?? 0) / total) : 0;
  const teacherApproved = total > 0 && (agg?.approved ?? 0) === total;

  return {
    averageStrength: average,
    totalAyahs: total,
    startedCount: agg?.started ?? 0,
    weakCount: agg?.weak ?? 0,
    stableCount: agg?.stable ?? 0,
    lockedCount: agg?.locked ?? 0,
    masteryLevel: masteryForAverage(average, teacherApproved),
  };
}

export const getSurahAggregate = (surah: number) => aggregate('surah', surah);
export const getPageAggregate = (page: number) => aggregate('page', page);
export const getJuzAggregate = (juz: number) => aggregate('juz', juz);

/** Count of ayat whose review is due now or overdue (drives the daily review). */
export async function getDueCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM memorization_states WHERE next_review_at IS NOT NULL AND next_review_at <= ?`,
    [new Date().toISOString()],
  );
  return row?.n ?? 0;
}

export interface DueReviewItem {
  key: string;
  surah: number;
  ayah: number;
  text: string;
  page: number;
  juz: number;
  strengthScore: number;
}

/**
 * Due murājaʿah items, weakest-first, with their Arabic text — the queue that
 * powers the daily active-recall review session. Weakest-first so the ayāt most
 * at risk of slipping get attention while focus is freshest.
 */
export async function getDueReviewItems(limit = 30): Promise<DueReviewItem[]> {
  const db = await getDb();
  return db.getAllAsync<DueReviewItem>(
    `SELECT m.ayah_key AS key, m.surah AS surah, a.ayah AS ayah, a.text AS text,
            m.page AS page, m.juz AS juz, m.strength_score AS strengthScore
       FROM memorization_states m
       JOIN ayahs a ON a.key = m.ayah_key
      WHERE m.next_review_at IS NOT NULL AND m.next_review_at <= ?
      ORDER BY m.strength_score ASC, m.next_review_at ASC
      LIMIT ?`,
    [new Date().toISOString(), limit],
  );
}

export interface DueBuckets {
  /** Sabaq — freshly memorized (reviewed ≤ once). */
  sabaq: number;
  /** Sabqi — recent lessons still consolidating (strength below stable). */
  sabqi: number;
  /** Manzil — long-term maintenance of stable ayāt. */
  manzil: number;
}

/** Classify the *due* ayāt into the classical sabaq / sabqi / manzil tracks. */
export async function getDueBuckets(): Promise<DueBuckets> {
  const db = await getDb();
  const row = await db.getFirstAsync<DueBuckets>(
    `SELECT
        SUM(CASE WHEN review_count <= 1 THEN 1 ELSE 0 END) AS sabaq,
        SUM(CASE WHEN review_count > 1 AND strength_score < 85 THEN 1 ELSE 0 END) AS sabqi,
        SUM(CASE WHEN review_count > 1 AND strength_score >= 85 THEN 1 ELSE 0 END) AS manzil
       FROM memorization_states
      WHERE next_review_at IS NOT NULL AND next_review_at <= ?`,
    [new Date().toISOString()],
  );
  return { sabaq: row?.sabaq ?? 0, sabqi: row?.sabqi ?? 0, manzil: row?.manzil ?? 0 };
}

/** Overall memorized footprint for the dashboard. */
export async function getOverallStats(): Promise<{ memorizedAyat: number; weakAyat: number }> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ memorized: number; weak: number }>(
    `SELECT
        SUM(CASE WHEN status IN ('almost_memorized','stable','locked','teacher_approved') THEN 1 ELSE 0 END) AS memorized,
        SUM(CASE WHEN status = 'weak' THEN 1 ELSE 0 END) AS weak
       FROM memorization_states`,
  );
  return { memorizedAyat: row?.memorized ?? 0, weakAyat: row?.weak ?? 0 };
}
