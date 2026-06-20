-- 0005 — Tasmiʿ recording/AI (Modules 8–10) + weak spots & repair (Module 11).

-- Recordings live in Supabase Storage; this table holds metadata only.
create table recordings (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  target                text not null,                 -- "67:1-5"
  storage_path          text not null,
  duration_ms           integer not null default 0,
  status                recording_status not null default 'uploaded',
  quality_ok            boolean not null default true,
  submitted_to_teacher  boolean not null default false,
  created_at            timestamptz not null default now()
);
create index recordings_user_idx on recordings (user_id, created_at desc);

create table tasmi_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  recording_id    uuid references recordings(id) on delete set null,
  target          text not null,
  overall_score   smallint not null default 0 check (overall_score between 0 and 100),
  summary         text not null default '',
  recommendation  text not null default '',
  created_at      timestamptz not null default now()
);
create index tasmi_sessions_user_idx on tasmi_sessions (user_id, created_at desc);

create table tasmi_segments (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references tasmi_sessions(id) on delete cascade,
  ayah_key      text not null references ayahs(ayah_key),
  expected_text text not null,
  detected_text text not null default '',
  start_ms      integer not null default 0,
  end_ms        integer not null default 0,
  score         smallint not null default 0 check (score between 0 and 100)
);

create table tasmi_mistakes (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references tasmi_sessions(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  ayah_key       text not null references ayahs(ayah_key),
  word_position  smallint,
  type           mistake_type not null,
  expected_text  text not null default '',
  detected_text  text not null default '',
  confidence     real not null default 0 check (confidence between 0 and 1),
  severity       severity not null default 'medium',
  start_ms       integer,
  end_ms         integer,
  repair_status  repair_status not null default 'unrepaired',
  created_at     timestamptz not null default now()
);
create index tasmi_mistakes_user_idx on tasmi_mistakes (user_id, ayah_key);

-- Weak spots are first-class objects (Section 9).
create table weak_spots (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  ayah_key        text not null references ayahs(ayah_key),
  word_start      smallint not null default 1,
  word_end        smallint not null default 1,
  type            weak_spot_type not null,
  severity        severity not null default 'medium',
  seen_count      integer not null default 1,
  repaired_count  integer not null default 0,
  last_seen_at    timestamptz not null default now(),
  next_review_at  timestamptz,
  status          repair_status not null default 'unrepaired',
  created_at      timestamptz not null default now()
);
create index weak_spots_user_status_idx on weak_spots (user_id, status);

create table repair_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  weak_spot_id uuid not null references weak_spots(id) on delete cascade,
  steps        jsonb not null default '[]'::jsonb,
  outcome      text not null default 'pending' check (outcome in ('pending','improved','failed')),
  created_at   timestamptz not null default now()
);
