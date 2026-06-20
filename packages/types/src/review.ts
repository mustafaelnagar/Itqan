/**
 * Review engine / murājaʿah scheduler (Module 7) and Hifz planner (Module 13).
 */
import type { AyahKey, ISODateTime, Score, UUID } from './common';

export type ReviewType =
  | 'new_hifz'
  | 'same_day'
  | 'next_day'
  | 'recent'
  | 'old_preservation'
  | 'weak_spot_repair'
  | 'random_test'
  | 'teacher_assignment';

export type ScopeType = 'ayah' | 'range' | 'page' | 'surah' | 'juz';

/** A single scheduled review obligation. */
export interface ReviewSchedule {
  id: UUID;
  userId: UUID;
  scopeType: ScopeType;
  /** Page/surah/juz number, or ayah key for ayah/range scopes. */
  scopeId: string;
  dueAt: ISODateTime;
  /** Higher = surfaced first. Weak items get boosted priority. */
  priority: number;
  reviewType: ReviewType;
  reason: string;
  estimatedMinutes: number;
  completedAt: ISODateTime | null;
}

export interface ReviewSession {
  id: UUID;
  userId: UUID;
  startedAt: ISODateTime;
  completedAt: ISODateTime | null;
  itemCount: number;
  strengthenedCount: number;
  stillWeakCount: number;
}

export interface ReviewItem {
  id: UUID;
  sessionId: UUID;
  scheduleId: UUID | null;
  ayahKey: AyahKey;
  reviewType: ReviewType;
  result: 'pending' | 'good' | 'weak' | 'skipped';
  confidence: Score | null;
}

// --- Hifz planner ---

export type HifzPlanType =
  | 'juz_amma'
  | 'surah'
  | 'full_quran'
  | 'review_existing'
  | 'ramadan'
  | 'teacher_assigned'
  | 'custom';

export interface HifzPlan {
  id: UUID;
  userId: UUID;
  type: HifzPlanType;
  title: string;
  startDate: ISODateTime;
  endDate: ISODateTime | null;
  /** New ayat per day. */
  dailyCapacity: number;
  createdAt: ISODateTime;
}

export interface HifzPlanItem {
  id: UUID;
  planId: UUID;
  /** Calendar day this item is assigned to (date-only ISO). */
  scheduledDate: ISODateTime;
  scopeType: ScopeType;
  scopeId: string;
  kind: 'new_hifz' | 'review';
  completedAt: ISODateTime | null;
}
