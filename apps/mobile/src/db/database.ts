/**
 * Native database backend (iOS/Android) — expo-sqlite.
 *
 * Web uses `database.web.ts` (sql.js) instead; Metro selects the right file per
 * platform. Both expose the same `getDb(): Promise<ItqanDb>` so repositories and
 * the seeder are platform-agnostic.
 */
import { SCHEMA_SQL } from './schema';
import { seedIfNeeded } from './seed';
import type { ItqanDb } from './types';

const DB_NAME = 'itqan.db';

let dbPromise: Promise<ItqanDb> | null = null;

export function getDb(): Promise<ItqanDb> {
  if (!dbPromise) {
    dbPromise = (async () => {
      // Lazy import so loading this module never touches the native module on web.
      const SQLite = await import('expo-sqlite');
      const native = await SQLite.openDatabaseAsync(DB_NAME);
      const db = native as unknown as ItqanDb;
      await db.execAsync(SCHEMA_SQL);
      await seedIfNeeded(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Test/debug helper: drop the shared handle so the next getDb() re-opens. */
export function resetDbHandle(): void {
  dbPromise = null;
}
