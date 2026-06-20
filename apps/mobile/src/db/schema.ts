/**
 * Local SQLite schema (QUR-009, OFF-001..005).
 *
 * Holds bundled Quran content (for offline reading + search) and user-owned data
 * (bookmarks, reading position, a sync queue). Content tables are seeded from
 * @itqan/quran-data; user tables sync to Supabase when online.
 */
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS app_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS surahs (
  number          INTEGER PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_simple     TEXT NOT NULL,
  name_english    TEXT NOT NULL,
  revelation_type TEXT NOT NULL,
  ayah_count      INTEGER NOT NULL,
  bismillah_pre   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ayahs (
  key        TEXT PRIMARY KEY,
  surah      INTEGER NOT NULL,
  ayah       INTEGER NOT NULL,
  text       TEXT NOT NULL,
  text_plain TEXT NOT NULL,     -- diacritic-stripped, for Arabic search
  page       INTEGER NOT NULL,
  juz        INTEGER NOT NULL,
  hizb       INTEGER NOT NULL,
  rub        INTEGER NOT NULL,
  sajda      TEXT
);
CREATE INDEX IF NOT EXISTS ayahs_surah_idx ON ayahs (surah, ayah);
CREATE INDEX IF NOT EXISTS ayahs_page_idx  ON ayahs (page);

CREATE TABLE IF NOT EXISTS translations (
  ayah_key TEXT NOT NULL,
  edition  TEXT NOT NULL,
  text     TEXT NOT NULL,
  PRIMARY KEY (ayah_key, edition)
);

-- User data ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS bookmarks (
  id         TEXT PRIMARY KEY,
  ayah_key   TEXT NOT NULL,
  collection TEXT,
  created_at TEXT NOT NULL,
  synced     INTEGER NOT NULL DEFAULT 0,
  deleted    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS bookmarks_ayah_idx ON bookmarks (ayah_key);

-- Outbound change queue for offline-first sync (OFF-004).
CREATE TABLE IF NOT EXISTS sync_queue (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  entity     TEXT NOT NULL,
  op         TEXT NOT NULL,         -- 'upsert' | 'delete'
  entity_id  TEXT NOT NULL,
  payload    TEXT NOT NULL,         -- JSON
  created_at TEXT NOT NULL
);

-- Memorization state (Module 6) — one row per ayah. The heart of the product.
CREATE TABLE IF NOT EXISTS memorization_states (
  ayah_key            TEXT PRIMARY KEY,
  surah               INTEGER NOT NULL,
  page                INTEGER NOT NULL,
  juz                 INTEGER NOT NULL,
  status              TEXT NOT NULL DEFAULT 'not_started',
  strength_score      INTEGER NOT NULL DEFAULT 0,
  review_count        INTEGER NOT NULL DEFAULT 0,
  mistake_count       INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at    TEXT,
  next_review_at      TEXT,
  teacher_approved_at TEXT,
  updated_at          TEXT NOT NULL,
  synced              INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS mem_surah_idx ON memorization_states (surah);
CREATE INDEX IF NOT EXISTS mem_page_idx  ON memorization_states (page);
CREATE INDEX IF NOT EXISTS mem_due_idx   ON memorization_states (next_review_at);

-- Hifz plans + generated daily items (Module 13).
CREATE TABLE IF NOT EXISTS hifz_plans (
  id             TEXT PRIMARY KEY,
  type           TEXT NOT NULL,
  title          TEXT NOT NULL,
  scope_type     TEXT NOT NULL,
  scope_id       TEXT NOT NULL,
  start_date     TEXT NOT NULL,
  end_date       TEXT,
  daily_capacity INTEGER NOT NULL,
  active         INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hifz_plan_items (
  id             TEXT PRIMARY KEY,
  plan_id        TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  first_ayah_key TEXT NOT NULL,
  last_ayah_key  TEXT NOT NULL,
  ayah_count     INTEGER NOT NULL,
  kind           TEXT NOT NULL DEFAULT 'new_hifz',
  completed_at   TEXT
);
CREATE INDEX IF NOT EXISTS plan_items_plan_idx ON hifz_plan_items (plan_id, scheduled_date);

-- Tasmiʿ sessions + detected mistakes (Modules 8–10).
CREATE TABLE IF NOT EXISTS tasmi_sessions (
  id             TEXT PRIMARY KEY,
  target         TEXT NOT NULL,        -- e.g. "67:1-5"
  overall_score  INTEGER NOT NULL,
  summary        TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  transcript     TEXT NOT NULL DEFAULT '',
  source         TEXT NOT NULL DEFAULT 'assisted', -- transcription provider used
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tasmi_sessions_created_idx ON tasmi_sessions (created_at DESC);

CREATE TABLE IF NOT EXISTS tasmi_mistakes (
  id            TEXT PRIMARY KEY,
  session_id    TEXT NOT NULL,
  ayah_key      TEXT NOT NULL,
  word_position INTEGER,
  type          TEXT NOT NULL,
  expected_text TEXT NOT NULL DEFAULT '',
  detected_text TEXT NOT NULL DEFAULT '',
  severity      TEXT NOT NULL DEFAULT 'medium'
);
CREATE INDEX IF NOT EXISTS tasmi_mistakes_session_idx ON tasmi_mistakes (session_id);

-- Weak spots (Module 11): mistakes become first-class, schedulable objects.
CREATE TABLE IF NOT EXISTS weak_spots (
  id             TEXT PRIMARY KEY,     -- deterministic: "<ayahKey>:<type>"
  ayah_key       TEXT NOT NULL,
  type           TEXT NOT NULL,
  severity       TEXT NOT NULL DEFAULT 'medium',
  seen_count     INTEGER NOT NULL DEFAULT 1,
  repaired_count INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'unrepaired',
  last_seen_at   TEXT NOT NULL,
  next_review_at TEXT,
  synced         INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS weak_spots_status_idx ON weak_spots (status);
`;

/** Bump when the bundled content shape changes to force a re-seed. */
export const CONTENT_SCHEMA_VERSION = 1;
