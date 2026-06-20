/**
 * Reader preferences (MUS-004, MUS-005, MUS-006): translation visibility,
 * font scale, script, theme override, and the chosen translation edition.
 * Persisted across launches.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MushafScript } from '@itqan/types';
import { DEFAULT_RECITER_ID } from '../audio/reciters';
import { asyncStorage } from './persist';

export type ThemePreference = 'system' | 'light' | 'dark';

/** Ayah-by-ayah cards vs. continuous printed-Mushaf page (MUS-001 / MUS-002). */
export type ReadingMode = 'ayah' | 'mushaf';

interface ReaderSettingsState {
  showTranslation: boolean;
  translationEdition: string;
  /** Multiplier applied to base Quran font size (0.8–1.8). */
  fontScale: number;
  script: MushafScript;
  themePreference: ThemePreference;
  preferredReciterId: string;
  readingMode: ReadingMode;

  toggleTranslation: () => void;
  setTranslationEdition: (edition: string) => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  setScript: (script: MushafScript) => void;
  setThemePreference: (pref: ThemePreference) => void;
  setReciter: (id: string) => void;
  toggleReadingMode: () => void;
}

const FONT_MIN = 0.8;
const FONT_MAX = 1.8;
const FONT_STEP = 0.1;
const clampFont = (v: number) => Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(v * 10) / 10));

export const useReaderSettings = create<ReaderSettingsState>()(
  persist(
    (set) => ({
      showTranslation: true,
      translationEdition: 'en.sahih',
      fontScale: 1,
      script: 'uthmani',
      themePreference: 'system',
      preferredReciterId: DEFAULT_RECITER_ID,
      readingMode: 'ayah',

      toggleTranslation: () => set((s) => ({ showTranslation: !s.showTranslation })),
      setTranslationEdition: (translationEdition) => set({ translationEdition }),
      increaseFont: () => set((s) => ({ fontScale: clampFont(s.fontScale + FONT_STEP) })),
      decreaseFont: () => set((s) => ({ fontScale: clampFont(s.fontScale - FONT_STEP) })),
      setScript: (script) => set({ script }),
      setThemePreference: (themePreference) => set({ themePreference }),
      setReciter: (preferredReciterId) => set({ preferredReciterId }),
      toggleReadingMode: () =>
        set((s) => ({ readingMode: s.readingMode === 'ayah' ? 'mushaf' : 'ayah' })),
    }),
    {
      name: 'itqan.reader-settings',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
