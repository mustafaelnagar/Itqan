-- 0003 — Auth profiles & roles (Module 2). Built on Supabase auth.users.

create table profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  display_name        text not null default '',
  role                user_role not null default 'student',
  age_group           age_group not null default 'adult',
  preferred_language  text not null default 'en',
  is_guest            boolean not null default false,
  avatar_url          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger profiles_set_updated_at
  before update on profiles for each row execute function set_updated_at();

create table student_profiles (
  profile_id            uuid primary key references profiles(id) on delete cascade,
  daily_hifz_capacity   smallint not null default 5 check (daily_hifz_capacity > 0),
  preferred_reciter_id  uuid references reciters(id),
  preferred_script      mushaf_script not null default 'uthmani'
);

create table teacher_profiles (
  profile_id    uuid primary key references profiles(id) on delete cascade,
  is_verified   boolean not null default false,
  institution   text,
  credentials   text
);

create table guardian_profiles (
  profile_id  uuid primary key references profiles(id) on delete cascade
);

-- Guardian <-> child links (a guardian supervises N children).
create table guardian_children (
  guardian_profile_id uuid not null references guardian_profiles(profile_id) on delete cascade,
  child_profile_id    uuid not null references profiles(id) on delete cascade,
  primary key (guardian_profile_id, child_profile_id)
);

-- Per-user privacy choices (Section 19).
create table privacy_settings (
  profile_id                     uuid primary key references profiles(id) on delete cascade,
  share_recordings_with_teacher  boolean not null default false,
  allow_guardian_visibility      boolean not null default false,
  public_sharing_disabled        boolean not null default true
);

-- Create a profile + privacy defaults automatically when an auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile_id uuid;
begin
  insert into profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''))
  returning id into new_profile_id;

  insert into privacy_settings (profile_id) values (new_profile_id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- True when the current JWT belongs to an admin profile. Defined here (not in
-- 0001) because it references `profiles`, and SQL function bodies are validated
-- at creation time. Used by the RLS policies in 0007.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;
