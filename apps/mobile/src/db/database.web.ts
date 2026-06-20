/**
 * Web database backend — sql.js (SQLite compiled to WebAssembly).
 *
 * Runs the exact same SQL as the native expo-sqlite backend, so every repository
 * works unchanged in the browser. The engine is loaded from a CDN at runtime (so
 * Metro never has to bundle the wasm/emscripten glue), and the database is
 * persisted to IndexedDB and restored on reload — content is seeded once, user
 * data (bookmarks, memorization, plans) survives across sessions.
 */
import { SCHEMA_SQL } from './schema';
import { seedIfNeeded } from './seed';
import type { ItqanDb, ItqanStatement, SqlParam } from './types';

// --- Minimal sql.js typings (we load it via <script>, not as a bundled import) ---
interface SqlJsStatement {
  bind(params?: SqlParam[]): boolean;
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  run(params?: SqlParam[]): void;
  free(): boolean;
}
interface SqlJsDatabase {
  run(sql: string, params?: SqlParam[]): void;
  exec(sql: string): unknown;
  prepare(sql: string): SqlJsStatement;
  export(): Uint8Array;
  getRowsModified(): number;
}
interface SqlJsStatic {
  Database: new (data?: Uint8Array) => SqlJsDatabase;
}
type InitSqlJs = (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;

// The sql.js engine (JS glue + wasm) is vendored into `public/` and served from
// the app's own origin — no CDN, fully offline. Re-vendor with `pnpm sync:sql-wasm`.
const SQLJS_JS = '/sql-wasm.js';
const SQLJS_WASM = '/sql-wasm.wasm';

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function loadSqlJs(): Promise<SqlJsStatic> {
  if (sqlJsPromise) return sqlJsPromise;
  sqlJsPromise = new Promise<SqlJsStatic>((resolve, reject) => {
    const w = window as unknown as { initSqlJs?: InitSqlJs };
    const init = () => w.initSqlJs!({ locateFile: () => SQLJS_WASM }).then(resolve, reject);
    if (w.initSqlJs) return init();
    const script = document.createElement('script');
    script.src = SQLJS_JS;
    script.onload = () => void init();
    script.onerror = () => reject(new Error('Failed to load the local sql.js engine'));
    document.head.appendChild(script);
  });
  return sqlJsPromise;
}

// --- IndexedDB persistence (single key holding the exported DB bytes) ---
const IDB_NAME = 'itqan';
const STORE = 'kv';
const KEY = 'sqlite';

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(): Promise<Uint8Array | null> {
  try {
    const idb = await openIdb();
    return await new Promise<Uint8Array | null>((resolve, reject) => {
      const req = idb.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as Uint8Array) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null; // first run / private mode — fall back to in-memory
  }
}

async function idbSet(bytes: Uint8Array): Promise<void> {
  try {
    const idb = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(bytes, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* persistence unavailable — session stays in-memory */
  }
}

let dbPromise: Promise<ItqanDb> | null = null;

export function getDb(): Promise<ItqanDb> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await loadSqlJs();
      const saved = await idbGet();
      const raw = new SQL.Database(saved ?? undefined);

      let saveTimer: ReturnType<typeof setTimeout> | null = null;
      const scheduleSave = () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          saveTimer = null;
          void idbSet(raw.export());
        }, 800);
      };

      const db: ItqanDb = {
        async execAsync(sql) {
          raw.exec(sql);
          scheduleSave();
        },
        async runAsync(sql, params = []) {
          raw.run(sql, params);
          scheduleSave();
          return { lastInsertRowId: 0, changes: raw.getRowsModified() };
        },
        async getAllAsync<T>(sql: string, params: SqlParam[] = []) {
          const stmt = raw.prepare(sql);
          stmt.bind(params);
          const rows: T[] = [];
          while (stmt.step()) rows.push(stmt.getAsObject() as unknown as T);
          stmt.free();
          return rows;
        },
        async getFirstAsync<T>(sql: string, params: SqlParam[] = []) {
          const stmt = raw.prepare(sql);
          stmt.bind(params);
          const row = stmt.step() ? (stmt.getAsObject() as unknown as T) : null;
          stmt.free();
          return row;
        },
        async withTransactionAsync(task) {
          raw.run('BEGIN');
          try {
            await task();
            raw.run('COMMIT');
          } catch (err) {
            raw.run('ROLLBACK');
            throw err;
          }
          scheduleSave();
        },
        async prepareAsync(sql): Promise<ItqanStatement> {
          const stmt = raw.prepare(sql);
          return {
            async executeAsync(params = []) {
              stmt.run(params);
              scheduleSave();
            },
            async finalizeAsync() {
              stmt.free();
            },
          };
        },
      };

      await db.execAsync(SCHEMA_SQL);
      await seedIfNeeded(db);
      return db;
    })();
  }
  return dbPromise;
}

export function resetDbHandle(): void {
  dbPromise = null;
}
