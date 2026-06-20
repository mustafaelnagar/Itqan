-- 0001 — Extensions, enums, and shared helpers.
-- Foundation for the Itqān data model. Idempotent where practical.

create extension if not exists "pgcrypto"; -- gen_random_uuid()
create extension if not exists "pg_trgm"; -- search (Arabic + translation)

-- ---------------------------------------------------------------------------
-- Shared enums (mirror packages/types domain model)
-- ---------------------------------------------------------------------------
create type user_role as enum ('student', 'teacher', 'guardian', 'admin');
create type age_group as enum ('child', 'teen', 'adult');
create type mushaf_script as enum ('uthmani', 'indopak', 'imlaei');
create type revelation_type as enum ('meccan', 'medinan');

create type memorization_status as enum (
  'not_started', 'familiar', 'learning', 'almost_memorized',
  'passed_once', 'weak', 'stable', 'locked', 'teacher_approved'
);

create type severity as enum ('low', 'medium', 'high');

create type mistake_type as enum (
  -- Level 1: memorization
  'missed_word', 'extra_word', 'wrong_word', 'repeated_word', 'skipped_ayah',
  'wrong_continuation', 'stopped_early', 'started_wrong_place', 'mixed_similar_ayah',
  -- Level 2: fluency
  'long_hesitation', 'repeated_restart', 'weak_phrase', 'unstable_connection',
  'over_reliance_on_hint', 'slow_recall',
  -- Level 3: tajweed signals
  'madd_duration', 'ghunnah', 'qalqalah', 'heavy_light_letter',
  'waqf_ibtida', 'idgham_ikhfa', 'tashkeel'
);

create type repair_status as enum ('unrepaired', 'repairing', 'repaired_once', 'stable');
create type weak_spot_type as enum (
  'word', 'phrase', 'ayah', 'transition', 'page_ending',
  'similar_ayah_confusion', 'tajweed_pattern'
);

create type review_type as enum (
  'new_hifz', 'same_day', 'next_day', 'recent', 'old_preservation',
  'weak_spot_repair', 'random_test', 'teacher_assignment'
);
create type scope_type as enum ('ayah', 'range', 'page', 'surah', 'juz');
create type hifz_plan_type as enum (
  'juz_amma', 'surah', 'full_quran', 'review_existing',
  'ramadan', 'teacher_assigned', 'custom'
);
create type link_status as enum ('pending', 'active', 'revoked');
create type recording_status as enum (
  'recording', 'uploaded', 'queued', 'processing', 'analyzed', 'failed'
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Auto-maintain updated_at on row update.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- NOTE: is_admin() is defined in 0003 (profiles_roles), after the `profiles`
-- table exists — SQL-language function bodies are validated at creation time.
