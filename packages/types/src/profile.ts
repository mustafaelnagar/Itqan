/**
 * Authentication, profiles, and roles (Module 2).
 */
import type { ISODateTime, UUID } from './common';

export type UserRole = 'student' | 'teacher' | 'guardian' | 'admin';

export type AgeGroup = 'child' | 'teen' | 'adult';

/** Base profile attached 1:1 to an auth user. */
export interface Profile {
  id: UUID;
  /** Maps to Supabase auth.users.id. */
  userId: UUID;
  displayName: string;
  /** Active role; a user may hold multiple role profiles. */
  role: UserRole;
  ageGroup: AgeGroup;
  preferredLanguage: string;
  /** Whether this is a guest (no auth account) profile. */
  isGuest: boolean;
  avatarUrl?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface StudentProfile {
  profileId: UUID;
  /** Daily new-Hifz capacity, in ayat. */
  dailyHifzCapacity: number;
  /** Default reciter for listening/Hifz. */
  preferredReciterId?: UUID;
  preferredScript: 'uthmani' | 'indopak' | 'imlaei';
}

export interface TeacherProfile {
  profileId: UUID;
  /** Verified-teacher flag, set by admin review. */
  isVerified: boolean;
  institution?: string;
  /** Ijazah / sanad note, free text. */
  credentials?: string;
}

export interface GuardianProfile {
  profileId: UUID;
  /** Profile ids of child accounts this guardian supervises. */
  childProfileIds: UUID[];
}

/** Per-user privacy choices (Module 2 / Section 19). */
export interface PrivacySettings {
  profileId: UUID;
  /** Recordings are private by default; never public without consent. */
  shareRecordingsWithTeacher: boolean;
  allowGuardianVisibility: boolean;
  /** Children can never opt into public sharing. */
  publicSharingDisabled: boolean;
}
