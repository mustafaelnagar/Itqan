/**
 * Offline-first sync (OFF-004, OFF-005).
 *
 * Push: drains the local `sync_queue` to Supabase in order.
 * Pull: refreshes local bookmarks from the server.
 * Conflict resolution v1: writes are idempotent (deterministic ids + upsert/delete),
 * so replaying the queue is safe; the server is the source of truth on pull.
 *
 * All operations no-op when there is no authenticated session (guest mode), so the
 * app is fully usable offline/without an account and syncs once signed in.
 */
import { logger } from '@itqan/logging';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getDb } from '../db/database';
import { pending, remove } from '../db/repositories/syncQueueRepo';

let running = false;

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Push queued local changes, then pull canonical bookmarks. Safe to call often. */
export async function runSync(): Promise<void> {
  if (running || !isSupabaseConfigured) return; // offline-first; nothing to sync to
  running = true;
  try {
    const userId = await currentUserId();
    if (!userId) return; // guest / offline — try again later
    await pushPending(userId);
    await pullBookmarks(userId);
  } catch (err) {
    logger.captureException(err, { feature: 'sync' });
  } finally {
    running = false;
  }
}

async function pushPending(userId: string): Promise<void> {
  const items = await pending();
  for (const item of items) {
    if (item.entity === 'bookmark') {
      const ayahKey = String(item.payload.ayahKey);
      const collection = (item.payload.collection as string | null) ?? null;
      if (item.op === 'upsert') {
        const { error } = await supabase
          .from('bookmarks')
          .upsert(
            { user_id: userId, ayah_key: ayahKey, collection },
            { onConflict: 'user_id,ayah_key,collection', ignoreDuplicates: true },
          );
        if (error) throw error;
      } else {
        let del = supabase.from('bookmarks').delete().eq('user_id', userId).eq('ayah_key', ayahKey);
        del = collection === null ? del.is('collection', null) : del.eq('collection', collection);
        const { error } = await del;
        if (error) throw error;
      }
    } else if (item.entity === 'memorization_state') {
      // Progress sync (MEM-008). Server upserts on (user_id, ayah_key).
      const { error } = await supabase.from('memorization_states').upsert(
        {
          user_id: userId,
          ayah_key: String(item.payload.ayahKey),
          page_number: item.payload.pageNumber,
          status: item.payload.status,
          strength_score: item.payload.strengthScore,
          last_reviewed_at: item.payload.lastReviewedAt,
          next_review_at: item.payload.nextReviewAt,
        },
        { onConflict: 'user_id,ayah_key' },
      );
      if (error) throw error;
    }
    await remove(item.id);
  }
}

async function pullBookmarks(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('ayah_key, collection, created_at')
    .eq('user_id', userId);
  if (error) throw error;

  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const row of data ?? []) {
      const id = `${row.ayah_key}|${row.collection ?? ''}`;
      await db.runAsync(
        `INSERT INTO bookmarks (id, ayah_key, collection, created_at, synced, deleted)
         VALUES (?, ?, ?, ?, 1, 0)
         ON CONFLICT(id) DO UPDATE SET synced = 1, deleted = 0`,
        [id, row.ayah_key, row.collection ?? null, row.created_at],
      );
    }
  });
}
