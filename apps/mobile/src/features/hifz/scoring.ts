/**
 * Memorization scoring (Module 6, v1).
 *
 * Pure functions so the rules are easy to reason about and tune. Manual marks
 * (weak/good/strong) move an ayah's 0–100 strength toward a target via an EMA,
 * which then drives its status and next-review interval (a simple spaced
 * repetition; the personalized decay curve is MEM-014, later).
 */
import { type MemorizationStatus, PageMasteryLevel } from '@itqan/types';

export type Mark = 'weak' | 'good' | 'strong';

const MARK_TARGET: Record<Mark, number> = { weak: 30, good: 65, strong: 90 };

/** Move strength toward the mark's target; first review jumps straight to it. */
export function nextStrength(current: number, mark: Mark, reviewCount: number): number {
  const target = MARK_TARGET[mark];
  if (reviewCount === 0) return target;
  // Weight recent performance a little more than history.
  return Math.round(current * 0.45 + target * 0.55);
}

/** Map a 0–100 strength to a living status. */
export function statusForScore(score: number): MemorizationStatus {
  if (score <= 0) return 'not_started';
  if (score < 40) return 'weak';
  if (score < 55) return 'learning';
  if (score < 70) return 'familiar';
  if (score < 85) return 'almost_memorized';
  if (score < 95) return 'stable';
  return 'locked';
}

/** Days until the next review, by strength (stronger → later). */
export function nextIntervalDays(score: number): number {
  if (score < 40) return 1;
  if (score < 55) return 2;
  if (score < 70) return 4;
  if (score < 85) return 7;
  if (score < 95) return 14;
  return 30;
}

/** Absolute next-review timestamp from a base time + strength. */
export function nextReviewAt(score: number, fromISO: string): string {
  const base = new Date(fromISO).getTime();
  return new Date(base + nextIntervalDays(score) * 24 * 60 * 60 * 1000).toISOString();
}

/** Derive a page/surah/juz mastery level from its average strength (MEM-013). */
export function masteryForAverage(avg: number, teacherApproved = false): PageMasteryLevel {
  if (teacherApproved) return PageMasteryLevel.TeacherApproved;
  if (avg <= 0) return PageMasteryLevel.NotStarted;
  if (avg < 31) return PageMasteryLevel.Familiar;
  if (avg < 51) return PageMasteryLevel.Learning;
  if (avg < 66) return PageMasteryLevel.CanReciteWithHints;
  if (avg < 79) return PageMasteryLevel.PassedOnce;
  if (avg < 89) return PageMasteryLevel.PassedMultipleDays;
  if (avg < 95) return PageMasteryLevel.StableUnderRandomTest;
  return PageMasteryLevel.Locked;
}
