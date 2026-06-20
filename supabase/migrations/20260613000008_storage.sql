-- 0008 — Storage buckets & policies.
-- Recordings are PRIVATE by default (Section 19). Audio content is public-read.

insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('quran-audio', 'quran-audio', true)
on conflict (id) do nothing;

-- Recordings: a user may only access objects under their own user-id prefix
-- (path convention: "<auth.uid()>/<recording-id>.<ext>").
create policy recordings_owner_rw on storage.objects for all to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);

-- Quran audio: world-readable, admin-writable.
create policy quran_audio_read on storage.objects for select to authenticated
  using (bucket_id = 'quran-audio');
create policy quran_audio_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'quran-audio' and is_admin())
  with check (bucket_id = 'quran-audio' and is_admin());
