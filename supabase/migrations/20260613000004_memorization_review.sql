-- 0004 — Memorization state (Module 6), review engine (Module 7), planner (Module 13).

-- The most important table in the system: a living memory record per ayah.
create table memorization_states (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  ayah_key            text not null references ayahs(ayah_key),
  page_number         smallint not null references pages(number),
  status              memorization_status not null default 'not_started',
  strength_score      smallint not null default 0 check (strength_score between 0 and 100),
  last_reviewed_at    timestamptz,
  next_review_at      timestamptz,
  last_tasmi_score    smallint check (last_tasmi_score between 0 and 100),
  mistake_count       integer not null default 0,
  weak_spot_count     integer not null default 0,
  teacher_approved_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, ayah_key)
);
create index mem_states_user_due_idx on memorization_states (user_id, next_review_at);
create index mem_states_user_status_idx on memorization_states (user_id, status);
create trigger mem_states_set_updated_at
  before update on memorization_states for each row execute function set_updated_at();

-- Hifz plans + daily items (Module 13).
create table hifz_plans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            hifz_plan_type not null,
  title           text not null,
  start_date      date not null,
  end_date        date,
  daily_capacity  smallint not null default 5 check (daily_capacity > 0),
  created_at      timestamptz not null default now()
);

create table hifz_plan_items (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid not null references hifz_plans(id) on delete cascade,
  scheduled_date  date not null,
  scope_type      scope_type not null,
  scope_id        text not null,
  kind            text not null check (kind in ('new_hifz', 'review')),
  completed_at    timestamptz
);
create index hifz_plan_items_plan_date_idx on hifz_plan_items (plan_id, scheduled_date);

-- Review schedules (Module 7).
create table review_schedules (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  scope_type        scope_type not null,
  scope_id          text not null,
  due_at            timestamptz not null,
  priority          smallint not null default 0,
  review_type       review_type not null,
  reason            text not null default '',
  estimated_minutes smallint not null default 0,
  completed_at      timestamptz
);
create index review_schedules_user_due_idx on review_schedules (user_id, due_at) where completed_at is null;

create table review_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,
  item_count         smallint not null default 0,
  strengthened_count smallint not null default 0,
  still_weak_count   smallint not null default 0
);

create table review_items (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references review_sessions(id) on delete cascade,
  schedule_id  uuid references review_schedules(id) on delete set null,
  ayah_key     text not null references ayahs(ayah_key),
  review_type  review_type not null,
  result       text not null default 'pending' check (result in ('pending','good','weak','skipped')),
  confidence   smallint check (confidence between 0 and 100)
);
