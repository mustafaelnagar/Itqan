/**
 * Ambient declarations for the bundled Quran JSON shipped by @itqan/quran-data.
 *
 * Declaring the exact module specifiers makes tsc treat these imports as typed
 * values WITHOUT parsing the (multi-MB) JSON into a literal type — Metro still
 * resolves and bundles the real asset at runtime.
 */
declare module '@itqan/quran-data/data/surahs.json' {
  import type { BundledSurah } from '@itqan/quran-data';
  const data: BundledSurah[];
  export default data;
}

declare module '@itqan/quran-data/data/ayahs.json' {
  import type { BundledAyah } from '@itqan/quran-data';
  const data: BundledAyah[];
  export default data;
}

declare module '@itqan/quran-data/data/pages.json' {
  import type { BundledBoundary } from '@itqan/quran-data';
  const data: BundledBoundary[];
  export default data;
}

declare module '@itqan/quran-data/data/juz.json' {
  import type { BundledBoundary } from '@itqan/quran-data';
  const data: BundledBoundary[];
  export default data;
}

declare module '@itqan/quran-data/data/translations/en.sahih.json' {
  import type { BundledTranslation } from '@itqan/quran-data';
  const data: BundledTranslation;
  export default data;
}
