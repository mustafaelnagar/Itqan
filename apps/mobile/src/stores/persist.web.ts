/**
 * Web persistence adapter for zustand `persist` (Metro picks this over
 * `persist.ts` for the web bundle).
 *
 * Selections are written to `localStorage` (no size limit, never expires) AND
 * mirrored into a long-lived first-party cookie, so a user's choices survive for
 * a long time even if one store is cleared — and are readable as a real cookie.
 * Persisted payloads are tiny (language, theme, reciter, last position, consent),
 * well within the ~4 KB cookie limit; anything larger skips the cookie mirror.
 *
 * IMPORTANT: the methods are async (return Promises), mirroring AsyncStorage. The
 * `persist` middleware drives hydration off this contract — a *synchronous*
 * storage here breaks the `onRehydrateStorage` timing, leaving stores stuck
 * un-hydrated (which blanks every gated screen).
 */
import type { StateStorage } from 'zustand/middleware';
import { cookies } from '../lib/cookies';

const COOKIE_MAX_BYTES = 3500;

const ls = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // private mode / storage blocked — fall back to cookies
  }
};

export const asyncStorage: StateStorage = {
  getItem: async (name) => ls()?.getItem(name) ?? cookies.get(name),
  setItem: async (name, value) => {
    ls()?.setItem(name, value);
    if (value.length <= COOKIE_MAX_BYTES) cookies.set(name, value);
  },
  removeItem: async (name) => {
    ls()?.removeItem(name);
    cookies.remove(name);
  },
};
