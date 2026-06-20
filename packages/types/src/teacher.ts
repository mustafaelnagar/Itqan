/**
 * Teacher + guardian workflows (Modules 14–15).
 * The AI helps the student clean up before submitting, but the teacher remains the authority.
 */
import type { ISODateTime, UUID } from './common';
import type { ScopeType } from './review';

export interface TeacherStudentLink {
  id: UUID;
  teacherProfileId: UUID;
  studentProfileId: UUID;
  status: 'pending' | 'active' | 'revoked';
  /** Invite code used to establish the link. */
  inviteCode?: string;
  createdAt: ISODateTime;
}

export interface TeacherAssignment {
  id: UUID;
  teacherProfileId: UUID;
  /** A single student, or all students in a class (bulk assignment). */
  studentProfileId: UUID | null;
  scopeType: ScopeType;
  scopeId: string;
  kind: 'memorize' | 'review' | 'submit_recording';
  dueAt: ISODateTime | null;
  note?: string;
  createdAt: ISODateTime;
}

export interface TeacherFeedback {
  id: UUID;
  teacherProfileId: UUID;
  studentProfileId: UUID;
  /** Optional linkage to a specific submission/recording. */
  recordingId: UUID | null;
  text?: string;
  /** Storage path of a voice note, if provided. */
  voiceNotePath?: string;
  createdAt: ISODateTime;
}

export interface TeacherApproval {
  id: UUID;
  teacherProfileId: UUID;
  studentProfileId: UUID;
  scopeType: ScopeType;
  scopeId: string;
  decision: 'approved' | 'rejected';
  note?: string;
  createdAt: ISODateTime;
}
