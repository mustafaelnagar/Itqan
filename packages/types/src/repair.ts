/**
 * Weak spots + repair mode (Module 11).
 * Every red mark becomes a repair path — mistake detection without repair is just criticism.
 */
import type { AyahKey, ISODateTime, Severity, UUID } from './common';

export type WeakSpotType =
  | 'word'
  | 'phrase'
  | 'ayah'
  | 'transition'
  | 'page_ending'
  | 'similar_ayah_confusion'
  | 'tajweed_pattern';

export type WeakSpotStatus = 'unrepaired' | 'repairing' | 'repaired_once' | 'stable';

export interface WeakSpot {
  id: UUID;
  userId: UUID;
  ayahKey: AyahKey;
  /** Word range within the ayah, 1-based inclusive. */
  wordStart: number;
  wordEnd: number;
  type: WeakSpotType;
  severity: Severity;
  seenCount: number;
  repairedCount: number;
  lastSeenAt: ISODateTime;
  nextReviewAt: ISODateTime | null;
  status: WeakSpotStatus;
  createdAt: ISODateTime;
}

/** A guided multi-step repair drill (listen → repeat → connect → blind test). */
export interface RepairSession {
  id: UUID;
  userId: UUID;
  weakSpotId: UUID;
  /** Ordered drill steps presented to the user. */
  steps: RepairStep[];
  /** Outcome of the final blind test. */
  outcome: 'pending' | 'improved' | 'failed';
  createdAt: ISODateTime;
}

export interface RepairStep {
  order: number;
  kind:
    | 'listen_once'
    | 'repeat_after_qari'
    | 'recite_phrase_alone'
    | 'recite_full_ayah'
    | 'connect_previous_ayah'
    | 'blind_test';
  completed: boolean;
}
