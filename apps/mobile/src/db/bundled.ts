/**
 * Static registry of bundled Quran data.
 *
 * Imports are resolved by Metro at bundle time and typed via the ambient
 * declarations in `src/types/bundled-data.d.ts` (so tsc never parses the JSON).
 * Translations are keyed by edition id so the seeder can iterate available ones.
 */
import type { BundledTranslation } from '@itqan/quran-data';
import surahs from '@itqan/quran-data/data/surahs.json';
import ayahs from '@itqan/quran-data/data/ayahs.json';
import pages from '@itqan/quran-data/data/pages.json';
import juz from '@itqan/quran-data/data/juz.json';
import enSahih from '@itqan/quran-data/data/translations/en.sahih.json';

export const bundled = { surahs, ayahs, pages, juz };

/** Translation editions bundled for offline use, keyed by edition id. */
export const bundledTranslations: Record<string, BundledTranslation> = {
  'en.sahih': enSahih,
};
