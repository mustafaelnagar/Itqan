/**
 * "Continue reading" position (MUS-008) — the last ayah the user was viewing.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { asyncStorage } from './persist';

export interface ReadingPosition {
  surah: number;
  ayah: number;
  ayahKey: string;
  surahName: string;
  updatedAt: string;
}

interface LastPositionState {
  position: ReadingPosition | null;
  setPosition: (position: Omit<ReadingPosition, 'updatedAt'>) => void;
  clear: () => void;
}

export const useLastPosition = create<LastPositionState>()(
  persist(
    (set) => ({
      position: null,
      setPosition: (position) =>
        set({ position: { ...position, updatedAt: new Date().toISOString() } }),
      clear: () => set({ position: null }),
    }),
    {
      name: 'itqan.last-position',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
