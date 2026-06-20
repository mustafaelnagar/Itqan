/**
 * Memorization state system (Module 6) — the heart of the product.
 * Every ayah carries a living memory status.
 */
import type { AyahKey, ISODateTime, Score, UUID } from './common';

/** The living memory status of an ayah. */
export type MemorizationStatus =
  | 'not_started'
  | 'familiar'
  | 'learning'
  | 'almost_memorized'
  | 'passed_once'
  | 'weak'
  | 'stable'
  | 'locked'
  | 'teacher_approved';

/** Page mastery progression (Section 8). */
export enum PageMasteryLevel {
  NotStarted = 0,
  Familiar = 1,
  Learning = 2,
  CanReciteWithHints = 3,
  PassedOnce = 4,
  PassedMultipleDays = 5,
  StableUnderRandomTest = 6,
  TeacherApproved = 7,
  Locked = 8,
}

/** Per-ayah memory record — the most important table in the system. */
export interface MemorizationState {
  id: UUID;
  userId: UUID;
  ayahKey: AyahKey;
  pageNumber: number;
  status: MemorizationStatus;
  /** 0–100 strength score driving review scheduling. */
  strengthScore: Score;
  lastReviewedAt: ISODateTime | null;
  nextReviewAt: ISODateTime | null;
  lastTasmiScore: Score | null;
  mistakeCount: number;
  weakSpotCount: number;
  teacherApprovedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Aggregated strength for a page/surah/juz, computed from member ayat. */
export interface MemoryAggregate {
  scopeType: 'page' | 'surah' | 'juz';
  scopeId: number;
  averageStrength: Score;
  masteryLevel?: PageMasteryLevel;
  ayahCount: number;
  weakCount: number;
  stableCount: number;
  lockedCount: number;
}
