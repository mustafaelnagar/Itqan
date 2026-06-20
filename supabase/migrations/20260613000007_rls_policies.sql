-- 0007 — Row-Level Security (FND-005, AUTH-005).
-- Default deny: every table gets RLS enabled, then explicit policies.
-- Principle: users access only their own data; content is world-readable;
-- teachers/guardians get scoped read access via consented links.

-- ---------------------------------------------------------------------------
-- Identity helpers
-- ---------------------------------------------------------------------------

-- The caller's profile id (profiles.id), or null.
create or replace function my_profile_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from profiles where user_id = auth.uid();
$$;

-- True if the caller (a teacher) has an active link to this student profile.
create or replace function teaches_student(student uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from teacher_student_links l
    where l.teacher_profile_id = my_profile_id()
      and l.student_profile_id = student
      and l.status = 'active'
  );
$$;

-- True if the caller (a guardian) supervises this child profile,
-- and the child has allowed guardian visibility.
create or replace function guards_child(child uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from guardian_children gc
    join privacy_settings ps on ps.profile_id = gc.child_profile_id
    where gc.guardian_profile_id = my_profile_id()
      and gc.child_profile_id = child
      and ps.allow_guardian_visibility = true
  );
$$;

-- Maps a user_id (auth.users.id) to its profile id, for cross-checks.
create or replace function profile_of(target_user uuid)
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from profiles where user_id = target_user;
$$;

-- ---------------------------------------------------------------------------
-- Content tables: readable by all authenticated users, writable by admin only.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'surahs','pages','juz','ayahs','words','translations','tafsir_entries',
    'reciters','audio_files','audio_segments','mushaf_layouts','content_versions'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy %I on %I for select to authenticated using (true);',
      t || '_read_all', t
    );
    execute format(
      'create policy %I on %I for all to authenticated using (is_admin()) with check (is_admin());',
      t || '_admin_write', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Owner-scoped tables: user_id = auth.uid(). Full CRUD for the owner.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'memorization_states','hifz_plans','review_schedules','review_sessions',
    'recordings','tasmi_sessions','tasmi_mistakes','weak_spots','repair_sessions',
    'bookmarks','user_notes','reflections','daily_stats'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy %I on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t || '_owner', t
    );
  end loop;
end $$;

-- Child tables keyed by a parent row's owner (no direct user_id column).
alter table hifz_plan_items enable row level security;
create policy hifz_plan_items_owner on hifz_plan_items for all to authenticated
  using (exists (select 1 from hifz_plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from hifz_plans p where p.id = plan_id and p.user_id = auth.uid()));

alter table review_items enable row level security;
create policy review_items_owner on review_items for all to authenticated
  using (exists (select 1 from review_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from review_sessions s where s.id = session_id and s.user_id = auth.uid()));

alter table tasmi_segments enable row level security;
create policy tasmi_segments_owner on tasmi_segments for all to authenticated
  using (exists (select 1 from tasmi_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from tasmi_sessions s where s.id = session_id and s.user_id = auth.uid()));

-- Teachers may read a linked student's memorization + recordings (consented).
create policy mem_states_teacher_read on memorization_states for select to authenticated
  using (teaches_student(profile_of(user_id)) or guards_child(profile_of(user_id)));
create policy recordings_teacher_read on recordings for select to authenticated
  using (
    submitted_to_teacher and teaches_student(profile_of(user_id))
    or guards_child(profile_of(user_id))
  );

-- ---------------------------------------------------------------------------
-- Profiles & role tables
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
create policy profiles_self on profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy profiles_linked_read on profiles for select to authenticated
  using (teaches_student(id) or guards_child(id) or is_admin());

do $$
declare t text;
begin
  foreach t in array array['student_profiles','teacher_profiles','guardian_profiles','privacy_settings'] loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy %I on %I for all to authenticated using (profile_id = my_profile_id()) with check (profile_id = my_profile_id());',
      t || '_self', t
    );
  end loop;
end $$;

-- Teacher profiles are publicly readable (so students can find/verify a teacher).
create policy teacher_profiles_public_read on teacher_profiles for select to authenticated using (true);

alter table guardian_children enable row level security;
create policy guardian_children_self on guardian_children for all to authenticated
  using (guardian_profile_id = my_profile_id()) with check (guardian_profile_id = my_profile_id());

-- ---------------------------------------------------------------------------
-- Teacher workflow tables
-- ---------------------------------------------------------------------------
alter table teacher_student_links enable row level security;
create policy tsl_teacher on teacher_student_links for all to authenticated
  using (teacher_profile_id = my_profile_id()) with check (teacher_profile_id = my_profile_id());
create policy tsl_student_read on teacher_student_links for select to authenticated
  using (student_profile_id = my_profile_id());

do $$
declare t text;
begin
  foreach t in array array['teacher_assignments','teacher_feedback','teacher_approvals'] loop
    execute format('alter table %I enable row level security;', t);
    -- Teacher owns the rows they create.
    execute format(
      'create policy %I on %I for all to authenticated using (teacher_profile_id = my_profile_id()) with check (teacher_profile_id = my_profile_id());',
      t || '_teacher', t
    );
    -- Student can read rows addressed to them (or to their whole class = null student).
    execute format(
      'create policy %I on %I for select to authenticated using (student_profile_id = my_profile_id() or student_profile_id is null);',
      t || '_student_read', t
    );
  end loop;
end $$;
