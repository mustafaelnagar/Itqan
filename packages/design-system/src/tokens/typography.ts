/**
 * Typography tokens.
 *
 * Two families: a clean UI sans for chrome, and a dedicated Mushaf/Arabic face
 * for Quran text (loaded by the app via expo-font; names are the contract here).
 */

export const fontFamily = {
  /** Latin UI text (Inter). App registers this via expo-font. */
  sans: 'Inter',
  /** Quran text — Amiri Quran (Uthmani orthography). App registers this name. */
  quran: 'AmiriQuran',
  /** Indo-Pak script alternative (not bundled yet). */
  quranIndoPak: 'IndoPak',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
  // Quran-specific reading sizes (user-adjustable in Mushaf)
  quranSm: 26,
  quranMd: 32,
  quranLg: 40,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
  // Arabic needs generous leading for diacritics
  quran: 2.0,
} as const;

/**
 * Named text roles consumed by the <Text> primitive.
 *
 * NOTE: React Native's `lineHeight` is in absolute px, NOT a multiplier, so each
 * variant's line height is `fontSize × ratio` (rounded), not the bare ratio.
 */
const lh = (size: number, ratio: number) => Math.round(size * ratio);

export const textVariants = {
  display: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lh(fontSize['3xl'], lineHeight.tight),
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lh(fontSize['2xl'], lineHeight.tight),
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lh(fontSize.xl, lineHeight.normal),
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lh(fontSize.md, lineHeight.normal),
  },
  bodyStrong: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lh(fontSize.md, lineHeight.normal),
  },
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lh(fontSize.sm, lineHeight.normal),
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lh(fontSize.xs, lineHeight.normal),
  },
} as const;

export type TextVariant = keyof typeof textVariants;
