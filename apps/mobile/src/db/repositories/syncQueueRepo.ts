/**
 * Outbound change queue (OFF-004). Every offline mutation to user data is
 * recorded here and drained to Supabase when connectivity returns.
 */
import { getDb } from '../database';

export type SyncOp = 'upsert' | 'delete';

export interface SyncQueueItem {
  id: number;
  entity: string;
  op: SyncOp;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export async function enqueue(
  entity: string,
  op: SyncOp,
  entityId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO sync_queue (entity, op, entity_id, payload, created_at) VALUES (?, ?, ?, ?, ?)`,
    [entity, op, entityId, JSON.stringify(payload), new Date().toISOString()],
  );
}

export async function pending(): Promise<SyncQueueItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    entity: string;
    op: string;
    entity_id: string;
    payload: string;
    created_at: string;
  }>(`SELECT * FROM sync_queue ORDER BY id ASC`);
  return rows.map((r) => ({
    id: r.id,
    entity: r.entity,
    op: r.op as SyncOp,
    entityId: r.entity_id,
    payload: JSON.parse(r.payload) as Record<string, unknown>,
    createdAt: r.created_at,
  }));
}

export async function remove(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
}
