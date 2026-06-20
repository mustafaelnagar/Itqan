/**
 * Arabic text helpers for search normalization.
 */

// Harakat/diacritics, superscript alef, Quranic annotation signs, tatweel,
// and zero-width marks. Written as \u escapes so no invisible chars live in source.
const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200B-\u200F\uFEFF]/g;

/**
 * Strip diacritics and normalize alef/ya/hamza variants so search matches
 * regardless of tashkeel or orthographic variation.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(DIACRITICS, '')
    .replace(/[آأإٱ]/g, 'ا') // alef variants -> ا
    .replace(/ة/g, 'ه') // ة -> ه
    .replace(/ى/g, 'ي') // ى -> ي
    .replace(/ؤ/g, 'و') // ؤ -> و
    .replace(/ئ/g, 'ي') // ئ -> ي
    .trim();
}

/** True if the query contains Arabic letters. */
export function isArabic(input: string): boolean {
  return /[؀-ۿ]/.test(input);
}
