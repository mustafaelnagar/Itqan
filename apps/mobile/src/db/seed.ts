/**
 * One-time content seeding from @itqan/quran-data, shared by the native and web
 * database backends. Guarded by a marker (schema version + data version) so it
 * runs only when the bundled content changes.
 */
import { meta as quranMeta } from '@itqan/quran-data';
import { logger } from '@itqan/logging';
import { normalizeArabic } from '../lib/arabic';
import { bundled, bundledTranslations } from './bundled';
import { CONTENT_SCHEMA_VERSION } from './schema';
import type { ItqanDb } from './types';

const seedMarker = () => `${CONTENT_SCHEMA_VERSION}:${quranMeta.version}`;

export async function seedIfNeeded(db: ItqanDb): Promise<void> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_meta WHERE key = 'content_seed'`,
  );
  if (row?.value === seedMarker()) return;

  logger.breadcrumb('db_seed_start', { marker: seedMarker() });

  await db.withTransactionAsync(async () => {
    // Clear content tables (idempotent re-seed); user data is untouched.
    await db.execAsync(`DELETE FROM surahs; DELETE FROM ayahs; DELETE FROM translations;`);

    const surahStmt = await db.prepareAsync(
      `INSERT INTO surahs (number, name_arabic, name_simple, name_english, revelation_type, ayah_count, bismillah_pre)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    try {
      for (const s of bundled.surahs) {
        await surahStmt.executeAsync([
          s.number,
          s.nameArabic,
          s.nameSimple,
          s.nameEnglish,
          s.revelationType,
          s.ayahCount,
          s.bismillahPre ? 1 : 0,
        ]);
      }
    } finally {
      await surahStmt.finalizeAsync();
    }

    const ayahStmt = await db.prepareAsync(
      `INSERT INTO ayahs (key, surah, ayah, text, text_plain, page, juz, hizb, rub, sajda)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    try {
      for (const a of bundled.ayahs) {
        await ayahStmt.executeAsync([
          a.key,
          a.surah,
          a.ayah,
          a.text,
          normalizeArabic(a.text),
          a.page,
          a.juz,
          a.hizb,
          a.rub,
          a.sajda,
        ]);
      }
    } finally {
      await ayahStmt.finalizeAsync();
    }

    const trStmt = await db.prepareAsync(
      `INSERT INTO translations (ayah_key, edition, text) VALUES (?, ?, ?)`,
    );
    try {
      for (const [edition, byKey] of Object.entries(bundledTranslations)) {
        for (const [ayahKey, text] of Object.entries(byKey)) {
          await trStmt.executeAsync([ayahKey, edition, text]);
        }
      }
    } finally {
      await trStmt.finalizeAsync();
    }

    await db.runAsync(
      `INSERT INTO app_meta (key, value) VALUES ('content_seed', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [seedMarker()],
    );
  });

  logger.breadcrumb('db_seed_done', {});
}
