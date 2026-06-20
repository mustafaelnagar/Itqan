/**
 * Bookmarks (MUS-007) — local-first, with each change queued for Supabase sync.
 * Local id is deterministic (`ayahKey|collection`); the server upserts on its
 * own unique constraint (user_id, ayah_key, collection).
 */
import { getDb } from '../database';
import { enqueue } from './syncQueueRepo';

export interface BookmarkRow {
  id: string;
  ayahKey: string;
  collection: string | null;
  createdAt: string;
}

export interface BookmarkWithAyah extends BookmarkRow {
  surah: number;
  ayah: number;
  text: string;
  surahName: string;
}

const localId = (ayahKey: string, collection?: string | null) => `${ayahKey}|${collection ?? ''}`;

export async function listBookmarks(): Promise<BookmarkWithAyah[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    ayah_key: string;
    collection: string | null;
    created_at: string;
    surah: number;
    ayah: number;
    text: string;
    surah_name: string;
  }>(
    `SELECT b.id, b.ayah_key, b.collection, b.created_at,
            a.surah, a.ayah, a.text, s.name_simple AS surah_name
       FROM bookmarks b
       JOIN ayahs a ON a.key = b.ayah_key
       JOIN surahs s ON s.number = a.surah
      WHERE b.deleted = 0
      ORDER BY b.created_at DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    ayahKey: r.ayah_key,
    collection: r.collection,
    createdAt: r.created_at,
    surah: r.surah,
    ayah: r.ayah,
    text: r.text,
    surahName: r.surah_name,
  }));
}

export async function isBookmarked(ayahKey: string): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM bookmarks WHERE ayah_key = ? AND deleted = 0`,
    [ayahKey],
  );
  return (row?.n ?? 0) > 0;
}

export async function addBookmark(ayahKey: string, collection?: string): Promise<void> {
  const db = await getDb();
  const id = localId(ayahKey, collection);
  const createdAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO bookmarks (id, ayah_key, collection, created_at, synced, deleted)
     VALUES (?, ?, ?, ?, 0, 0)
     ON CONFLICT(id) DO UPDATE SET deleted = 0, synced = 0`,
    [id, ayahKey, collection ?? null, createdAt],
  );
  await enqueue('bookmark', 'upsert', id, { ayahKey, collection: collection ?? null, createdAt });
}

export async function removeBookmark(ayahKey: string, collection?: string): Promise<void> {
  const db = await getDb();
  const id = localId(ayahKey, collection);
  await db.runAsync(`UPDATE bookmarks SET deleted = 1, synced = 0 WHERE id = ?`, [id]);
  await enqueue('bookmark', 'delete', id, { ayahKey, collection: collection ?? null });
}

export async function toggleBookmark(ayahKey: string): Promise<boolean> {
  const has = await isBookmarked(ayahKey);
  if (has) {
    await removeBookmark(ayahKey);
    return false;
  }
  await addBookmark(ayahKey);
  return true;
}
