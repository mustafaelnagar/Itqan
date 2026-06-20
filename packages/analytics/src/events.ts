/**
 * Analytics event schema (FND-009).
 *
 * Respectful-by-design (Section 19): events track product usage, never recitation
 * content, audio, or scores tied to identity beyond a pseudonymous user id.
 * No public leaderboards, no vanity metrics. Every event is explicitly typed here —
 * arbitrary string events are not allowed.
 */

/** Discriminated union of every analytics event the product may emit. */
export type AnalyticsEvent =
  // App lifecycle
  | { name: 'app_opened'; props: { coldStart: boolean } }
  | { name: 'onboarding_completed'; props: { role: 'student' | 'teacher' | 'guardian' } }
  // Mushaf / reading
  | { name: 'mushaf_opened'; props: { mode: 'page' | 'surah' | 'ayah' | 'translation' } }
  | { name: 'bookmark_added'; props: Record<string, never> }
  // Audio
  | { name: 'audio_played'; props: { scope: 'ayah' | 'range' | 'page' | 'surah' } }
  | { name: 'audio_downloaded'; props: { scope: 'surah' | 'juz' } }
  // Hifz studio
  | { name: 'hifz_session_started'; props: { plannedMinutes: number } }
  | { name: 'hifz_session_completed'; props: { ayatCount: number; durationMs: number } }
  | {
      name: 'hifz_drill_used';
      props: { drill: 'first_word' | 'hide_reveal' | 'connection' | 'reverse' | 'spine' };
    }
  // Review engine
  | { name: 'review_generated'; props: { itemCount: number; estimatedMinutes: number } }
  | { name: 'review_completed'; props: { strengthened: number; stillWeak: number } }
  // Tasmiʿ
  | { name: 'tasmi_recorded'; props: { durationMs: number } }
  | { name: 'tasmi_analyzed'; props: { mistakeCount: number } }
  | { name: 'repair_started'; props: { weakSpotType: string } }
  | { name: 'repair_completed'; props: { outcome: 'improved' | 'failed' } }
  // Teacher
  | { name: 'assignment_created'; props: { kind: string } }
  | { name: 'recording_submitted_to_teacher'; props: Record<string, never> }
  | { name: 'teacher_approved'; props: Record<string, never> };

export type AnalyticsEventName = AnalyticsEvent['name'];

/** Extract the props type for a given event name. */
export type PropsFor<N extends AnalyticsEventName> = Extract<AnalyticsEvent, { name: N }>['props'];
