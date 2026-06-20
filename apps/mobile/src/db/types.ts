/**
 * Platform-agnostic database contract.
 *
 * Repositories and the seeder depend only on this interface — never on a concrete
 * engine. Native (`database.ts`) backs it with expo-sqlite; web (`database.web.ts`)
 * backs it with sql.js (SQLite compiled to WebAssembly). Metro picks the right file
 * per platform, so the same SQL runs everywhere.
 */
export type SqlParam = string | number | null;

export interface ItqanStatement {
  executeAsync(params?: SqlParam[]): Promise<unknown>;
  finalizeAsync(): Promise<void>;
}

export interface ItqanDb {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlParam[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T>(sql: string, params?: SqlParam[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params?: SqlParam[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
  prepareAsync(sql: string): Promise<ItqanStatement>;
}
