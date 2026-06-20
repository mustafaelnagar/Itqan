/**
 * Tasmiʿ recording + AI layer (Modules 8–10).
 * The AI answers "did the user correctly recite this expected range?",
 * not "what did the user say?".
 */
import type { AyahKey, ISODateTime, Score, Severity, UUID } from './common';

/** Mistake taxonomy. Level 1 (memorization) is MVP; later levels added with humility. */
export type MistakeType =
  // Level 1 — memorization (MVP)
  | 'missed_word'
  | 'extra_word'
  | 'wrong_word'
  | 'repeated_word'
  | 'skipped_ayah'
  | 'wrong_continuation'
  | 'stopped_early'
  | 'started_wrong_place'
  | 'mixed_similar_ayah'
  // Level 2 — fluency
  | 'long_hesitation'
  | 'repeated_restart'
  | 'weak_phrase'
  | 'unstable_connection'
  | 'over_reliance_on_hint'
  | 'slow_recall'
  // Level 3 — tajweed signals (treated as "possible", verify with teacher)
  | 'madd_duration'
  | 'ghunnah'
  | 'qalqalah'
  | 'heavy_light_letter'
  | 'waqf_ibtida'
  | 'idgham_ikhfa'
  | 'tashkeel';

export type RecordingStatus =
  | 'recording'
  | 'uploaded'
  | 'queued'
  | 'processing'
  | 'analyzed'
  | 'failed';

export interface Recording {
  id: UUID;
  userId: UUID;
  /** Expected target, e.g. "67:1-5". */
  target: string;
  storagePath: string;
  durationMs: number;
  status: RecordingStatus;
  /** Quality gate result (silence/noise/too-short). */
  qualityOk: boolean;
  submittedToTeacher: boolean;
  createdAt: ISODateTime;
}

export interface TasmiSession {
  id: UUID;
  userId: UUID;
  recordingId: UUID | null;
  target: string;
  /** 0–100 overall recall score. */
  overallScore: Score;
  /** Merciful, teacher-style summary line. */
  summary: string;
  recommendation: string;
  createdAt: ISODateTime;
}

/** A contiguous analyzed slice of a session (one ayah or phrase). */
export interface TasmiSegment {
  id: UUID;
  sessionId: UUID;
  ayahKey: AyahKey;
  expectedText: string;
  detectedText: string;
  startMs: number;
  endMs: number;
  score: Score;
}

export interface TasmiMistake {
  id: UUID;
  sessionId: UUID;
  userId: UUID;
  ayahKey: AyahKey;
  /** 1-based word position within the ayah, or null for ayah-level issues. */
  wordPosition: number | null;
  type: MistakeType;
  expectedText: string;
  detectedText: string;
  /** Model confidence 0–1; surfaced to keep the AI humble. */
  confidence: number;
  severity: Severity;
  startMs: number | null;
  endMs: number | null;
  repairStatus: 'unrepaired' | 'repairing' | 'repaired_once' | 'stable';
  createdAt: ISODateTime;
}

/** Structured result returned by the AI service to the app. */
export interface TasmiResult {
  sessionId: UUID;
  target: string;
  overallScore: Score;
  mistakes: TasmiMistake[];
  recommendation: string;
  /** Always present for tajweed-level signals. */
  disclaimer?: string;
}
