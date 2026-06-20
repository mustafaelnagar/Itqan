/**
 * Hifz preferences: daily new-memorization target (HIFZ-009) and the default
 * number of listen repeats used when starting a session.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { asyncStorage } from './persist';

interface HifzSettingsState {
  /** New ayat per day (also the default plan capacity). */
  dailyTarget: number;
  /** How many times each ayah plays in the listen step of a session. */
  sessionRepeats: number;
  setDailyTarget: (n: number) => void;
  setSessionRepeats: (n: number) => void;
}

export const useHifzSettings = create<HifzSettingsState>()(
  persist(
    (set) => ({
      dailyTarget: 5,
      sessionRepeats: 3,
      setDailyTarget: (n) => set({ dailyTarget: Math.max(1, Math.min(50, n)) }),
      setSessionRepeats: (n) => set({ sessionRepeats: Math.max(1, Math.min(10, n)) }),
    }),
    { name: 'itqan.hifz-settings', storage: createJSONStorage(() => asyncStorage) },
  ),
);
