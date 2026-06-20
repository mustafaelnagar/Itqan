/**
 * Tasmiʿ mistake-detection engine (Module 9, MVP).
 *
 * This is the deterministic core — "did the user recite the expected text?", not
 * generic speech-to-text. Given the expected ayat and a recognized transcript, it
 * aligns the two token streams (Needleman–Wunsch) and classifies differences into
 * memorization mistakes: missed / extra / wrong / repeated word, skipped ayah,
 * stopped early. Pure and synchronous, so it is fully testable and runs offline.
 *
 * The transcription ("the ear") is a separate, pluggable concern; this engine is
 * the same regardless of which recognizer produced the transcript.
 */
import type { MistakeType, Severity } from '@itqan/types';
import { normalizeArabic } from '../../lib/arabic';

export interface ExpectedAyah {
  ayahKey: string;
  text: string;
}

export type WordStatus = 'correct' | 'wrong' | 'missed';

export interface WordResult {
  text: string;
  status: WordStatus;
}

export interface AyahSegment {
  ayahKey: string;
  words: WordResult[];
}

export interface DetectedMistake {
  ayahKey: string;
  /** 1-based word index within the ayah, or null for ayah-level issues. */
  wordPosition: number | null;
  type: MistakeType;
  expected: string;
  detected: string;
  severity: Severity;
}

export interface TasmiAnalysis {
  overallScore: number; // 0–100
  summary: string;
  recommendation: string;
  segments: AyahSegment[];
  mistakes: DetectedMistake[];
}

export interface Token {
  raw: string;
  norm: string;
  ayahKey: string;
  /** 1-based position within its ayah. */
  position: number;
}

export const tokenize = (text: string): string[] =>
  normalizeArabic(text)
    .split(/\s+/)
    .filter((t) => t.length > 0);

export function buildExpectedTokens(ayat: ExpectedAyah[]): Token[] {
  const out: Token[] = [];
  for (const ayah of ayat) {
    // Keep the raw (un-normalized) words for display, aligned with normalized ones.
    const raw = ayah.text.split(/\s+/).filter(Boolean);
    const norm = tokenize(ayah.text);
    // raw and norm should align 1:1; if normalization dropped a token, fall back to raw.
    raw.forEach((word, i) => {
      out.push({
        raw: word,
        norm: norm[i] ?? normalizeArabic(word),
        ayahKey: ayah.ayahKey,
        position: i + 1,
      });
    });
  }
  return out;
}

type Op = 'match' | 'sub' | 'del' | 'ins';

/** Global alignment (Needleman–Wunsch) of expected vs recited normalized tokens. */
function align(expected: Token[], recited: string[]): { op: Op; e?: Token; r?: string }[] {
  const n = expected.length;
  const m = recited.length;
  const MATCH = 2;
  const MISMATCH = -1;
  const GAP = -1;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i]![0] = i * GAP;
  for (let j = 1; j <= m; j++) dp[0]![j] = j * GAP;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const same = expected[i - 1]!.norm === recited[j - 1];
      const diag = dp[i - 1]![j - 1]! + (same ? MATCH : MISMATCH);
      const up = dp[i - 1]![j]! + GAP; // delete expected (missed)
      const left = dp[i]![j - 1]! + GAP; // insert recited (extra)
      dp[i]![j] = Math.max(diag, up, left);
    }
  }

  // Traceback.
  const ops: { op: Op; e?: Token; r?: string }[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = expected[i - 1]!.norm === recited[j - 1];
      if (dp[i]![j] === dp[i - 1]![j - 1]! + (same ? MATCH : MISMATCH)) {
        ops.push({ op: same ? 'match' : 'sub', e: expected[i - 1], r: recited[j - 1] });
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && dp[i]![j] === dp[i - 1]![j]! + GAP) {
      ops.push({ op: 'del', e: expected[i - 1] });
      i--;
    } else {
      ops.push({ op: 'ins', r: recited[j - 1] });
      j--;
    }
  }
  return ops.reverse();
}

const SEV: Record<string, Severity> = {
  missed_word: 'medium',
  wrong_word: 'medium',
  extra_word: 'low',
  repeated_word: 'low',
  skipped_ayah: 'high',
  stopped_early: 'high',
};

/**
 * Analyze a recitation attempt against the expected ayat.
 * @param expected ordered expected ayat
 * @param transcript recognized recitation (raw recognized text)
 */
export function analyzeTasmi(expected: ExpectedAyah[], transcript: string): TasmiAnalysis {
  const eTokens = buildExpectedTokens(expected);
  const rTokens = tokenize(transcript);

  // Empty/near-empty transcript → nothing was recited.
  if (eTokens.length === 0) {
    return {
      overallScore: 0,
      summary: 'No expected text.',
      recommendation: '',
      segments: [],
      mistakes: [],
    };
  }

  const ops = align(eTokens, rTokens);

  // Per-expected-token status for color-coded display.
  const statusByToken = new Map<Token, WordStatus>();
  const mistakes: DetectedMistake[] = [];
  let correct = 0;

  // First pass: assign statuses and per-token wrong-word mistakes.
  for (const o of ops) {
    if (o.op === 'match' && o.e) {
      statusByToken.set(o.e, 'correct');
      correct++;
    } else if (o.op === 'sub' && o.e) {
      statusByToken.set(o.e, 'wrong');
      mistakes.push({
        ayahKey: o.e.ayahKey,
        wordPosition: o.e.position,
        type: 'wrong_word',
        expected: o.e.raw,
        detected: o.r ?? '',
        severity: SEV.wrong_word!,
      });
    } else if (o.op === 'del' && o.e) {
      statusByToken.set(o.e, 'missed');
    }
  }

  // Extra/repeated words: an 'ins' immediately after a 'match' of the same token = repeat.
  for (let k = 0; k < ops.length; k++) {
    const o = ops[k]!;
    if (o.op !== 'ins' || !o.r) continue;
    const prev = ops[k - 1];
    const anchor = findAnchorAyah(ops, k);
    const isRepeat = prev && (prev.op === 'match' || prev.op === 'sub') && prev.r === o.r;
    mistakes.push({
      ayahKey: anchor,
      wordPosition: null,
      type: isRepeat ? 'repeated_word' : 'extra_word',
      expected: '',
      detected: o.r,
      severity: isRepeat ? SEV.repeated_word! : SEV.extra_word!,
    });
  }

  // Collapse contiguous "missed" runs per ayah into skipped_ayah / stopped_early / missed_word.
  collapseMissedRuns(expected, eTokens, statusByToken, mistakes);

  // Build display segments.
  const segments: AyahSegment[] = expected.map((a) => ({
    ayahKey: a.ayahKey,
    words: eTokens
      .filter((t) => t.ayahKey === a.ayahKey)
      .map((t) => ({ text: t.raw, status: statusByToken.get(t) ?? 'missed' })),
  }));

  const extras = mistakes.filter(
    (m) => m.type === 'extra_word' || m.type === 'repeated_word',
  ).length;
  const score = Math.max(
    0,
    Math.min(100, Math.round((correct / eTokens.length) * 100) - Math.min(15, extras * 2)),
  );

  return {
    overallScore: score,
    summary: summarize(score, mistakes),
    recommendation: recommend(mistakes),
    segments,
    mistakes,
  };
}

function findAnchorAyah(ops: { op: Op; e?: Token; r?: string }[], k: number): string {
  for (let i = k; i >= 0; i--) if (ops[i]!.e) return ops[i]!.e!.ayahKey;
  for (let i = k; i < ops.length; i++) if (ops[i]!.e) return ops[i]!.e!.ayahKey;
  return '';
}

function collapseMissedRuns(
  expected: ExpectedAyah[],
  eTokens: Token[],
  status: Map<Token, WordStatus>,
  mistakes: DetectedMistake[],
): void {
  const lastAyahKey = expected[expected.length - 1]?.ayahKey;
  for (const ayah of expected) {
    const toks = eTokens.filter((t) => t.ayahKey === ayah.ayahKey);
    const missedCount = toks.filter((t) => status.get(t) === 'missed').length;
    if (missedCount === 0) continue;

    if (missedCount === toks.length) {
      // Whole ayah absent: skipped, unless it's the trailing ayah → stopped early.
      mistakes.push({
        ayahKey: ayah.ayahKey,
        wordPosition: null,
        type: ayah.ayahKey === lastAyahKey ? 'stopped_early' : 'skipped_ayah',
        expected: ayah.text,
        detected: '',
        severity: 'high',
      });
      continue;
    }
    // Partial: one missed_word mistake per contiguous run.
    let runStart: Token | null = null;
    const flush = (end: Token) => {
      if (!runStart) return;
      mistakes.push({
        ayahKey: ayah.ayahKey,
        wordPosition: runStart.position,
        type: 'missed_word',
        expected: toks
          .filter((t) => t.position >= runStart!.position && t.position <= end.position)
          .map((t) => t.raw)
          .join(' '),
        detected: '',
        severity: SEV.missed_word!,
      });
      runStart = null;
    };
    let prev: Token | null = null;
    for (const t of toks) {
      if (status.get(t) === 'missed') {
        if (!runStart) runStart = t;
        prev = t;
      } else if (runStart && prev) {
        flush(prev);
      }
    }
    if (runStart && prev) flush(prev);
  }
}

function summarize(score: number, mistakes: DetectedMistake[]): string {
  if (mistakes.length === 0) return 'Mā shāʾ Allāh — a clean recitation.';
  if (score >= 85) return 'Strong recall, with a few spots to tidy.';
  if (score >= 60) return 'Good effort — a few weak connections to firm up.';
  return 'You are close. Let’s repair these together, gently.';
}

function recommend(mistakes: DetectedMistake[]): string {
  if (mistakes.length === 0) return 'Keep it firm — review again tomorrow.';
  const skipped = mistakes.find((m) => m.type === 'skipped_ayah' || m.type === 'stopped_early');
  if (skipped)
    return 'Listen to the full passage once, then recite it connected before testing again.';
  const counts = mistakes.reduce<Record<string, number>>((acc, m) => {
    acc[m.type] = (acc[m.type] ?? 0) + 1;
    return acc;
  }, {});
  const worst = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (worst === 'wrong_word')
    return 'Loop the words that slipped, then recite the ayah from memory.';
  if (worst === 'missed_word')
    return 'Drill the missed phrases three times, then test the ayah blind.';
  return 'Repeat the marked phrases once each, then review this passage tomorrow.';
}
