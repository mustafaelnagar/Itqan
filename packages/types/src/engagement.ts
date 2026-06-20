/**
 * Personal study artifacts and stats: bookmarks, notes, reflections, daily stats.
 */
import type { AyahKey, ISODateTime, UUID } from './common';

export interface Bookmark {
  id: UUID;
  userId: UUID;
  ayahKey: AyahKey;
  /** Optional named collection, e.g. "Duʿā ayat". */
  collection?: string;
  createdAt: ISODateTime;
}

export interface UserNote {
  id: UUID;
  userId: UUID;
  ayahKey: AyahKey;
  text: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Reflection {
  id: UUID;
  userId: UUID;
  ayahKey: AyahKey | null;
  text: string;
  createdAt: ISODateTime;
}

/** One row per user per day, powering streaks and dashboards. */
export interface DailyStats {
  id: UUID;
  userId: UUID;
  /** Date-only ISO, e.g. "2026-06-13". */
  date: string;
  ayatMemorized: number;
  ayatReviewed: number;
  listeningMs: number;
  tasmiSessions: number;
  weakSpotsRepaired: number;
}
