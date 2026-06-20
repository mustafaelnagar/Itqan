/**
 * Read-only access to bundled Quran content (surahs, ayahs, translations, search).
 */
import type { RevelationType } from '@itqan/types';
import { getDb } from '../database';
import { normalizeArabic, isArabic } from '../../lib/arabic';

export interface SurahRow {
  number: number;
  nameArabic: string;
  nameSimple: string;
  nameEnglish: string;
  revelationType: RevelationType;
  ayahCount: number;
  bismillahPre: boolean;
}

export interface AyahRow {
  key: string;
  surah: number;
  ayah: number;
  text: string;
  page: number;
  juz: number;
  hizb: number;
  rub: number;
  sajda: 'recommended' | 'obligatory' | null;
  /** Present when a translation edition is requested. */
  translation?: string;
}

export interface SearchResult {
  key: string;
  surah: number;
  ayah: number;
  text: string;
  translation: string | null;
  surahName: string;
}

const toSurah = (r: RawSurah): SurahRow => ({
  number: r.number,
  nameArabic: r.name_arabic,
  nameSimple: r.name_simple,
  nameEnglish: r.name_english,
  revelationType: r.revelation_type as RevelationType,
  ayahCount: r.ayah_count,
  bismillahPre: r.bismillah_pre === 1,
});

interface RawSurah {
  number: number;
  name_arabic: string;
  name_simple: string;
  name_english: string;
  revelation_type: string;
  ayah_count: number;
  bismillah_pre: number;
}

interface RawAyah {
  key: string;
  surah: number;
  ayah: number;
  text: string;
  page: number;
  juz: number;
  hizb: number;
  rub: number;
  sajda: string | null;
  translation: string | null;
}

const toAyah = (r: RawAyah): AyahRow => ({
  key: r.key,
  surah: r.surah,
  ayah: r.ayah,
  text: r.text,
  page: r.page,
  juz: r.juz,
  hizb: r.hizb,
  rub: r.rub,
  sajda: (r.sajda as AyahRow['sajda']) ?? null,
  translation: r.translation ?? undefined,
});

export async function getSurahs(): Promise<SurahRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RawSurah>(`SELECT * FROM surahs ORDER BY number`);
  return rows.map(toSurah);
}

export async function getSurah(number: number): Promise<SurahRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<RawSurah>(`SELECT * FROM surahs WHERE number = ?`, [number]);
  return row ? toSurah(row) : null;
}

/** Ayahs of a surah, optionally joined with a translation edition. */
export async function getSurahAyahs(surah: number, edition?: string): Promise<AyahRow[]> {
  return queryAyahs(`a.surah = ?`, [surah], edition);
}

/** Ayahs on a Mushaf page, optionally joined with a translation edition. */
export async function getPageAyahs(page: number, edition?: string): Promise<AyahRow[]> {
  return queryAyahs(`a.page = ?`, [page], edition);
}

/** Ordinal for global ayah ordering ("67:3" -> 67003). Ayah numbers are < 1000. */
function ayahOrdinal(key: string): number {
  const [surah, ayah] = key.split(':').map(Number);
  return (surah ?? 0) * 1000 + (ayah ?? 0);
}

/** Ayahs between two keys inclusive, in Mushaf order (may span surahs). */
export async function getAyahsBetween(
  firstKey: string,
  lastKey: string,
  edition?: string,
): Promise<AyahRow[]> {
  return queryAyahs(
    `(a.surah * 1000 + a.ayah) BETWEEN ? AND ?`,
    [ayahOrdinal(firstKey), ayahOrdinal(lastKey)],
    edition,
  );
}

async function queryAyahs(
  where: string,
  params: (string | number)[],
  edition?: string,
): Promise<AyahRow[]> {
  const db = await getDb();
  if (edition) {
    const rows = await db.getAllAsync<RawAyah>(
      `SELECT a.*, t.text AS translation
         FROM ayahs a
         LEFT JOIN translations t ON t.ayah_key = a.key AND t.edition = ?
        WHERE ${where}
        ORDER BY a.surah, a.ayah`,
      [edition, ...params],
    );
    return rows.map(toAyah);
  }
  const rows = await db.getAllAsync<RawAyah>(
    `SELECT a.*, NULL AS translation FROM ayahs a WHERE ${where} ORDER BY a.surah, a.ayah`,
    params,
  );
  return rows.map(toAyah);
}

export interface AyahKeyRef {
  key: string;
  surah: number;
  ayah: number;
  page: number;
  juz: number;
}

/** Scopes the planner can build a plan from. */
export type PlanScopeType = 'surah' | 'juz' | 'all' | 'surah_range';

/**
 * Ordered ayah refs for a memorization scope (used by the planner).
 * For 'surah_range', `scopeId` is the first surah and `scopeIdEnd` the last
 * (inclusive); order is normalized so either direction works.
 * For 'surah', an optional `ayahStart`/`ayahEnd` narrows the plan to a sub-range
 * of ayāt within that surah; omit both to memorize the whole surah.
 */
export async function getScopeAyahRefs(
  scopeType: PlanScopeType,
  scopeId: number | null,
  scopeIdEnd?: number | null,
  ayahStart?: number | null,
  ayahEnd?: number | null,
): Promise<AyahKeyRef[]> {
  const db = await getDb();
  const cols = `key, surah, ayah, page, juz`;
  if (scopeType === 'all') {
    return db.getAllAsync<AyahKeyRef>(`SELECT ${cols} FROM ayahs ORDER BY surah, ayah`);
  }
  if (scopeType === 'surah_range') {
    const lo = Math.min(scopeId as number, scopeIdEnd as number);
    const hi = Math.max(scopeId as number, scopeIdEnd as number);
    return db.getAllAsync<AyahKeyRef>(
      `SELECT ${cols} FROM ayahs WHERE surah BETWEEN ? AND ? ORDER BY surah, ayah`,
      [lo, hi],
    );
  }
  if (scopeType === 'surah' && ayahStart != null && ayahEnd != null) {
    const lo = Math.min(ayahStart, ayahEnd);
    const hi = Math.max(ayahStart, ayahEnd);
    return db.getAllAsync<AyahKeyRef>(
      `SELECT ${cols} FROM ayahs WHERE surah = ? AND ayah BETWEEN ? AND ? ORDER BY surah, ayah`,
      [scopeId as number, lo, hi],
    );
  }
  return db.getAllAsync<AyahKeyRef>(
    `SELECT ${cols} FROM ayahs WHERE ${scopeType} = ? ORDER BY surah, ayah`,
    [scopeId as number],
  );
}

/**
 * Search Arabic (diacritic-insensitive) and the given translation edition.
 * Returns up to `limit` results ordered by position in the Mushaf.
 */
export async function searchAyahs(
  query: string,
  edition = 'en.sahih',
  limit = 50,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const db = await getDb();
  const arabic = `%${normalizeArabic(trimmed)}%`;
  const latin = `%${trimmed.toLowerCase()}%`;

  // If the query is Arabic, weight Arabic matches; otherwise search translation.
  const rows = await db.getAllAsync<RawSearch>(
    `SELECT a.key, a.surah, a.ayah, a.text, t.text AS translation, s.name_simple AS surah_name
       FROM ayahs a
       JOIN surahs s ON s.number = a.surah
       LEFT JOIN translations t ON t.ayah_key = a.key AND t.edition = ?
      WHERE a.text_plain LIKE ? ${isArabic(trimmed) ? '' : 'OR LOWER(t.text) LIKE ?'}
      ORDER BY a.surah, a.ayah
      LIMIT ?`,
    isArabic(trimmed) ? [edition, arabic, limit] : [edition, arabic, latin, limit],
  );

  return rows.map((r) => ({
    key: r.key,
    surah: r.surah,
    ayah: r.ayah,
    text: r.text,
    translation: r.translation ?? null,
    surahName: r.surah_name,
  }));
}

interface RawSearch {
  key: string;
  surah: number;
  ayah: number;
  text: string;
  translation: string | null;
  surah_name: string;
}
