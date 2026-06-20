/**
 * Color tokens.
 *
 * Palette is intentionally calm and dignified — deep greens, warm cream/parchment,
 * and a restrained gold accent. No loud, gamified colors. Semantic memory-state
 * colors mirror the Mushaf underline system (green/yellow/red/dotted/lock/stamp).
 */

/** Raw palette scales — do not consume directly in UI; use `theme` instead. */
export const palette = {
  // Primary — deep emerald/teal "mihrab" green
  green: {
    50: '#EAF4EF',
    100: '#CFE6DA',
    200: '#A6D0BB',
    300: '#74B594',
    400: '#4A9B73',
    500: '#2E7D5B',
    600: '#226349',
    700: '#1A4D39',
    800: '#123829',
    900: '#0B241A',
  },
  // Warm parchment / cream for reading surfaces
  sand: {
    50: '#FBF7EF',
    100: '#F4ECDC',
    200: '#E9DCC1',
    300: '#D9C49B',
    400: '#C6A876',
    500: '#B08D55',
  },
  // Restrained gold accent (used sparingly — approval, mastery)
  gold: {
    300: '#E5C97B',
    500: '#C9A227',
    700: '#9A7B16',
  },
  // Neutral ink scale
  ink: {
    0: '#FFFFFF',
    50: '#F6F6F4',
    100: '#ECECE8',
    200: '#D7D7D1',
    300: '#B8B8B0',
    400: '#8C8C84',
    500: '#62625C',
    600: '#46463F',
    700: '#2E2E29',
    800: '#1C1C19',
    900: '#0F0F0D',
  },
  // Status hues (muted, not alarming)
  red: { 400: '#C76B5E', 500: '#B0493B', 600: '#8E3729' },
  amber: { 400: '#D6A24A', 500: '#C2862B' },
  blue: { 400: '#5B86A8', 500: '#3F6C8E' },
} as const;

/**
 * Memory-state semantic colors — the Mushaf "living map" (Section 1 & 3).
 * Used for ayah underlines, page strength overlays, and dashboard heatmaps.
 */
export const memoryColors = {
  strong: palette.green[500], // green underline
  dueSoon: palette.amber[500], // yellow underline
  weak: palette.red[500], // red underline
  mistakeHistory: palette.ink[400], // dotted underline
  locked: palette.gold[500], // lock icon
  teacherApproved: palette.green[700], // teacher stamp
  notStarted: palette.ink[200],
} as const;

export type MemoryColorKey = keyof typeof memoryColors;

/**
 * Vibrant gradients — jewel tones over an Islamic emerald-and-gold base. Used for
 * the home hero and the mode cards to give the app life while staying dignified.
 * Each value is an ordered list of color stops for a linear gradient.
 */
export const gradients = {
  /** Deep emerald → jade hero. */
  hero: ['#0B4A38', '#0F6E54', '#16A37B'],
  /** Mushaf — emerald. */
  mushaf: ['#0F7A57', '#17A87D'],
  /** Hifz Studio — jade/teal. */
  hifz: ['#0C6E73', '#15A0A6'],
  /** Tasmiʿ — gold/amber. */
  tasmi: ['#B0791A', '#E0AC44'],
  /** Review / memory — indigo-violet. */
  review: ['#3C4A8C', '#6172BE'],
  /** Warm gold accent sheen. */
  gold: ['#C9A227', '#E5C97B'],
} as const;

export type GradientKey = keyof typeof gradients;
