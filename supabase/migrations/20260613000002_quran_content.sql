-- 0002 — Quran content layer (Module 1). The spine of the app.
-- This data is global/read-only for users; only admins write it.

create table surahs (
  number            smallint primary key check (number between 1 and 114),
  name_arabic       text not null,
  name_simple       text not null,
  name_english      text not null,
  revelation_type   revelation_type not null,
  revelation_order  smallint not null,
  ayah_count        smallint not null check (ayah_count > 0),
  bismillah_pre     boolean not null default true
);

create table pages (
  number          smallint primary key check (number between 1 and 604),
  juz_number      smallint not null,
  first_ayah_key  text not null,
  last_ayah_key   text not null,
  line_count      smallint not null default 15
);

create table juz (
  number          smallint primary key check (number between 1 and 30),
  first_ayah_key  text not null,
  last_ayah_key   text not null
);

create table ayahs (
  ayah_key      text primary key,                 -- "67:1"
  surah_number  smallint not null references surahs(number),
  ayah_number   smallint not null check (ayah_number > 0),
  text_uthmani  text not null,
  text_indopak  text,
  text_imlaei   text,
  page_number   smallint not null references pages(number),
  juz_number    smallint not null references juz(number),
  hizb_number   smallint not null,
  rub_number    smallint not null,
  sajda         text check (sajda in ('recommended', 'obligatory')),
  unique (surah_number, ayah_number)
);
create index ayahs_page_idx on ayahs (page_number);
create index ayahs_juz_idx on ayahs (juz_number);
create index ayahs_text_trgm_idx on ayahs using gin (text_uthmani gin_trgm_ops);

create table words (
  id              uuid primary key default gen_random_uuid(),
  ayah_key        text not null references ayahs(ayah_key) on delete cascade,
  position        smallint not null check (position > 0),
  text_uthmani    text not null,
  transliteration text,
  translation     text,
  root            text,
  line_number     smallint,
  unique (ayah_key, position)
);

create table translations (
  id            uuid primary key default gen_random_uuid(),
  ayah_key      text not null references ayahs(ayah_key) on delete cascade,
  resource_id   text not null,                    -- "en.sahih"
  language_code text not null,
  text          text not null,
  unique (ayah_key, resource_id)
);
create index translations_text_trgm_idx on translations using gin (text gin_trgm_ops);

create table tafsir_entries (
  id            uuid primary key default gen_random_uuid(),
  ayah_key      text not null references ayahs(ayah_key) on delete cascade,
  resource_id   text not null,
  language_code text not null,
  text          text not null,
  unique (ayah_key, resource_id)
);

create table reciters (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  name_arabic    text not null,
  style          text check (style in ('murattal', 'mujawwad', 'muallim')),
  audio_base_url text not null
);

create table audio_files (
  id            uuid primary key default gen_random_uuid(),
  reciter_id    uuid not null references reciters(id) on delete cascade,
  surah_number  smallint not null references surahs(number),
  url           text not null,
  duration_ms   integer not null check (duration_ms >= 0),
  format        text not null check (format in ('mp3', 'opus', 'm4a')),
  unique (reciter_id, surah_number)
);

-- Word/ayah timestamps for synced highlighting and AI forced alignment.
create table audio_segments (
  id            uuid primary key default gen_random_uuid(),
  audio_file_id uuid not null references audio_files(id) on delete cascade,
  ayah_key      text not null references ayahs(ayah_key),
  word_position smallint,                          -- null = ayah-level segment
  start_ms      integer not null check (start_ms >= 0),
  end_ms        integer not null check (end_ms >= start_ms)
);
create index audio_segments_file_idx on audio_segments (audio_file_id, ayah_key);

create table mushaf_layouts (
  id           uuid primary key default gen_random_uuid(),
  script       mushaf_script not null,
  page_number  smallint not null references pages(number),
  line_number  smallint not null,
  ayah_key     text not null references ayahs(ayah_key),
  word_start   smallint not null,
  word_end     smallint not null,
  alignment    text not null default 'justified' check (alignment in ('justified', 'centered'))
);
create index mushaf_layouts_page_idx on mushaf_layouts (script, page_number, line_number);

-- Content versioning so Quran data can update safely (QUR-010).
create table content_versions (
  id           uuid primary key default gen_random_uuid(),
  resource     text not null check (resource in ('quran-text','translation','tafsir','layout','audio')),
  version      text not null,
  published_at timestamptz not null default now()
);
