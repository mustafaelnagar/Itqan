/** Formatting helpers. */

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Render a number using Eastern Arabic-Indic digits (e.g. 12 -> ١٢). */
export function toArabicNumerals(n: number): string {
  return String(n)
    .split('')
    .map((c) => (c >= '0' && c <= '9' ? ARABIC_DIGITS[Number(c)] : c))
    .join('');
}

/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
