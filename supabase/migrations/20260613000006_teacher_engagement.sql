-- 0006 — Teacher workflows (Module 14) + personal study artifacts & stats.

create table teacher_student_links (
  id                  uuid primary key default gen_random_uuid(),
  teacher_profile_id  uuid not null references teacher_profiles(profile_id) on delete cascade,
  student_profile_id  uuid not null references profiles(id) on delete cascade,
  status              link_status not null default 'pending',
  invite_code         text,
  created_at          timestamptz not null default now(),
  unique (teacher_profile_id, student_profile_id)
);
create index tsl_student_idx on teacher_student_links (student_profile_id);

create table teacher_assignments (
  id                  uuid primary key default gen_random_uuid(),
  teacher_profile_id  uuid not null references teacher_profiles(profile_id) on delete cascade,
  student_profile_id  uuid references profiles(id) on delete cascade,  -- null = whole class
  scope_type          scope_type not null,
  scope_id            text not null,
  kind                text not null check (kind in ('memorize','review','submit_recording')),
  due_at              timestamptz,
  note                text,
  created_at          timestamptz not null default now()
);

create table teacher_feedback (
  id                  uuid primary key default gen_random_uuid(),
  teacher_profile_id  uuid not null references teacher_profiles(profile_id) on delete cascade,
  student_profile_id  uuid not null references profiles(id) on delete cascade,
  recording_id        uuid references recordings(id) on delete set null,
  text                text,
  voice_note_path     text,
  created_at          timestamptz not null default now()
);

create table teacher_approvals (
  id                  uuid primary key default gen_random_uuid(),
  teacher_profile_id  uuid not null references teacher_profiles(profile_id) on delete cascade,
  student_profile_id  uuid not null references profiles(id) on delete cascade,
  scope_type          scope_type not null,
  scope_id            text not null,
  decision            text not null check (decision in ('approved','rejected')),
  note                text,
  created_at          timestamptz not null default now()
);

-- Personal study artifacts.
create table bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  ayah_key    text not null references ayahs(ayah_key),
  collection  text,
  created_at  timestamptz not null default now(),
  unique (user_id, ayah_key, collection)
);

create table user_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  ayah_key    text not null references ayahs(ayah_key),
  text        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger user_notes_set_updated_at
  before update on user_notes for each row execute function set_updated_at();

create table reflections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  ayah_key    text references ayahs(ayah_key),
  text        text not null,
  created_at  timestamptz not null default now()
);

-- One row per user per day; powers streaks & dashboards.
create table daily_stats (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  date                  date not null,
  ayat_memorized        integer not null default 0,
  ayat_reviewed         integer not null default 0,
  listening_ms          bigint not null default 0,
  tasmi_sessions        integer not null default 0,
  weak_spots_repaired   integer not null default 0,
  unique (user_id, date)
);
