/**
 * Persistence for Tasmiʿ results (Modules 9–11): saves the session + detected
 * mistakes, turns each mistaken ayah into a scheduled weak spot, and pulls its
 * memorization strength down so the Review Engine surfaces it sooner.
 */
import type { Severity } from '@itqan/types';
import { getDb } from '../database';
import { weakenAyah } from './memorizationRepo';
import type { TasmiAnalysis } from '../../features/tasmi/engine';

export interface TasmiSessionRow {
  id: string;
  target: string;
  overallScore: number;
  summary: string;
  recommendation: string;
  createdAt: string;
  mistakeCount: number;
}

export interface WeakSpotRow {
  id: string;
  ayahKey: string;
  type: string;
  severity: string;
  seenCount: number;
  repairedCount: number;
  status: 'unrepaired' | 'repairing' | 'repaired_once' | 'stable';
  nextReviewAt: string | null;
}

const isWeakSpotType = (t: string): boolean =>
  t === 'skipped_ayah' || t === 'stopped_early' || t === 'wrong_word' || t === 'missed_word';

/** Save a Tasmiʿ analysis; returns the new session id. */
export async function saveTasmiResult(
  target: string,
  analysis: TasmiAnalysis,
  transcript: string,
  source: string,
): Promise<string> {
  const db = await getDb();
  const now = new Date().toISOString();
  const sessionId = `tasmi-${Date.now()}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO tasmi_sessions (id, target, overall_score, summary, recommendation, transcript, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        target,
        analysis.overallScore,
        analysis.summary,
        analysis.recommendation,
        transcript,
        source,
        now,
      ],
    );

    for (let i = 0; i < analysis.mistakes.length; i++) {
      const m = analysis.mistakes[i]!;
      await db.runAsync(
        `INSERT INTO tasmi_mistakes (id, session_id, ayah_key, word_position, type, expected_text, detected_text, severity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${sessionId}-${i}`,
          sessionId,
          m.ayahKey,
          m.wordPosition,
          m.type,
          m.expected,
          m.detected,
          m.severity,
        ],
      );
    }

    // One weak spot per (ayah, mistake-type) worth repairing; bump severity/seen.
    const upserts = new Map<string, { ayahKey: string; type: string; severity: Severity }>();
    for (const m of analysis.mistakes) {
      if (!isWeakSpotType(m.type)) continue;
      upserts.set(`${m.ayahKey}:${m.type}`, {
        ayahKey: m.ayahKey,
        type: m.type,
        severity: m.severity,
      });
    }
    const next = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    for (const [id, w] of upserts) {
      await db.runAsync(
        `INSERT INTO weak_spots (id, ayah_key, type, severity, seen_count, repaired_count, status, last_seen_at, next_review_at, synced)
         VALUES (?, ?, ?, ?, 1, 0, 'unrepaired', ?, ?, 0)
         ON CONFLICT(id) DO UPDATE SET
           seen_count = weak_spots.seen_count + 1,
           severity = excluded.severity,
           status = CASE WHEN weak_spots.status = 'stable' THEN 'repairing' ELSE 'unrepaired' END,
           last_seen_at = excluded.last_seen_at,
           next_review_at = excluded.next_review_at,
           synced = 0`,
        [id, w.ayahKey, w.type, w.severity, now, next],
      );
    }
  });

  // Downgrade memorization strength for every mistaken ayah (outside the txn so
  // each lookup/upsert is simple; idempotent).
  const ayahKeys = [...new Set(analysis.mistakes.map((m) => m.ayahKey))].filter(Boolean);
  for (const key of ayahKeys) await weakenAyah(key);

  return sessionId;
}

export async function listTasmiSessions(limit = 20): Promise<TasmiSessionRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    target: string;
    overall_score: number;
    summary: string;
    recommendation: string;
    created_at: string;
    mistake_count: number;
  }>(
    `SELECT s.*, (SELECT COUNT(*) FROM tasmi_mistakes m WHERE m.session_id = s.id) AS mistake_count
       FROM tasmi_sessions s ORDER BY s.created_at DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    target: r.target,
    overallScore: r.overall_score,
    summary: r.summary,
    recommendation: r.recommendation,
    createdAt: r.created_at,
    mistakeCount: r.mistake_count,
  }));
}

export async function listWeakSpots(): Promise<WeakSpotRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    ayah_key: string;
    type: string;
    severity: string;
    seen_count: number;
    repaired_count: number;
    status: string;
    next_review_at: string | null;
  }>(`SELECT * FROM weak_spots WHERE status != 'stable' ORDER BY last_seen_at DESC`);
  return rows.map((r) => ({
    id: r.id,
    ayahKey: r.ayah_key,
    type: r.type,
    severity: r.severity,
    seenCount: r.seen_count,
    repairedCount: r.repaired_count,
    status: r.status as WeakSpotRow['status'],
    nextReviewAt: r.next_review_at,
  }));
}

/** Mark a weak spot one step closer to stable after a successful repair retest. */
export async function markWeakSpotRepaired(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE weak_spots
        SET repaired_count = repaired_count + 1,
            status = CASE WHEN repaired_count + 1 >= 2 THEN 'stable'
                          WHEN repaired_count + 1 = 1 THEN 'repaired_once'
                          ELSE 'repairing' END,
            synced = 0
      WHERE id = ?`,
    [id],
  );
}
