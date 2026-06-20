/**
 * Shared primitives used across every domain module.
 */

/** ISO-8601 timestamp string, e.g. "2026-06-13T08:31:00.000Z". */
export type ISODateTime = string;

/** UUID v4 string. */
export type UUID = string;

/**
 * Standard ayah address in `surah:ayah` form, e.g. "67:1".
 * This is the canonical join key across content, memory, and Tasmiʿ data.
 */
export type AyahKey = `${number}:${number}`;

/** Fields present on every persisted row. */
export interface Timestamps {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** A 0–100 score used for memory strength, confidence, and accuracy. */
export type Score = number;

/** Severity shared by mistakes and weak spots. */
export type Severity = 'low' | 'medium' | 'high';

/** Discriminated result wrapper for service/API calls. */
export type Result<T, E = ItqanError> = { ok: true; data: T } | { ok: false; error: E };

export interface ItqanError {
  code: string;
  message: string;
  /** Optional machine-readable details for debugging/telemetry. */
  details?: Record<string, unknown>;
}

/** Cursor-based pagination envelope. */
export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}
