/**
 * Live, on-the-fly recitation aligner (Tasmiʿ).
 *
 * As the recognizer streams recited words, we sync them against the stored ayah
 * text in real time — advancing a pointer, lighting each word green as it's
 * matched, and tolerating the two things speech recognizers do constantly:
 *   • REPEATS — "الحمد لله الحمد لله الحمد لله…" → extra copies are ignored, the
 *     pointer doesn't move backward.
 *   • SMALL SKIPS — a couple of words jumped → a short look-ahead resyncs and
 *     marks the skipped words as missed.
 *
 * Pure & deterministic: re-run over the whole recognized stream on each update.
 */
import { type Token, tokenize, buildExpectedTokens, type ExpectedAyah } from './engine';

export type LiveWordStatus = 'pending' | 'current' | 'correct' | 'missed';

export interface LiveAyahView {
  ayahKey: string;
  words: { raw: string; status: LiveWordStatus }[];
}

export interface LiveState {
  /** Per-ayah views for rendering live highlights. */
  ayat: LiveAyahView[];
  /** Index of the next expected token. */
  pointer: number;
  matched: number;
  total: number;
  /** 0–1 progress through the passage. */
  progress: number;
  complete: boolean;
}

const LOOKAHEAD = 3;

/** Match a recognized token stream against expected tokens; returns per-token status. */
export function matchLive(
  tokens: Token[],
  recognized: string[],
): { statuses: LiveWordStatus[]; pointer: number; matched: number } {
  const n = tokens.length;
  const statuses: LiveWordStatus[] = new Array<LiveWordStatus>(n).fill('pending');
  let ptr = 0;
  let matched = 0;

  for (const r of recognized) {
    if (ptr >= n) break;
    if (r === tokens[ptr]!.norm) {
      statuses[ptr] = 'correct';
      ptr++;
      matched++;
      continue;
    }
    // Look ahead a few words in case the reciter skipped one or two.
    let skip = -1;
    for (let k = 1; k <= LOOKAHEAD && ptr + k < n; k++) {
      if (r === tokens[ptr + k]!.norm) {
        skip = k;
        break;
      }
    }
    if (skip > 0) {
      for (let j = ptr; j < ptr + skip; j++) statuses[j] = 'missed';
      statuses[ptr + skip] = 'correct';
      ptr += skip + 1;
      matched++;
    }
    // Otherwise the token is a repeat / filler / mis-hearing → ignore, hold pointer.
  }

  if (ptr < n) statuses[ptr] = 'current';
  return { statuses, pointer: ptr, matched };
}

/** Build the live state for rendering, from expected ayat + the recognized transcript so far. */
export function alignLive(expected: ExpectedAyah[], transcript: string): LiveState {
  const tokens = buildExpectedTokens(expected);
  const recognized = tokenize(transcript);
  const { statuses, pointer, matched } = matchLive(tokens, recognized);

  const ayat: LiveAyahView[] = expected.map((a) => ({ ayahKey: a.ayahKey, words: [] }));
  const byKey = new Map(ayat.map((v) => [v.ayahKey, v]));
  tokens.forEach((t, i) => {
    byKey.get(t.ayahKey)?.words.push({ raw: t.raw, status: statuses[i]! });
  });

  const total = tokens.length;
  return {
    ayat,
    pointer,
    matched,
    total,
    progress: total === 0 ? 0 : Math.min(1, pointer / total),
    complete: pointer >= total && total > 0,
  };
}
