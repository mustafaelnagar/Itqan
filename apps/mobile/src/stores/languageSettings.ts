/**
 * App language / locale preference.
 *
 * Default is Arabic (RTL) — this is a Quran app, and Arabic is the language of
 * the text itself. Supported: Arabic, English, Urdu, Persian. Persisted across
 * launches; read reactively so the whole UI re-renders on change.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LANG, type Lang } from '../i18n/languages';
import { asyncStorage } from './persist';

interface LanguageState {
  lang: Lang;
  /** True once the user has picked a language in first-launch onboarding. */
  onboarded: boolean;
  /** True after the persisted state has loaded — guards the onboarding gate. */
  hydrated: boolean;
  setLang: (lang: Lang) => void;
  setOnboarded: (onboarded: boolean) => void;
}

export const useLanguageSettings = create<LanguageState>()(
  persist(
    (set) => ({
      lang: DEFAULT_LANG,
      onboarded: false,
      hydrated: false,
      setLang: (lang) => set({ lang }),
      setOnboarded: (onboarded) => set({ onboarded }),
    }),
    {
      name: 'itqan.language',
      storage: createJSONStorage(() => asyncStorage),
      // Only persist the user's choices; `hydrated` is a runtime-only flag.
      partialize: (s) => ({ lang: s.lang, onboarded: s.onboarded }),
      onRehydrateStorage: () => () => {
        useLanguageSettings.setState({ hydrated: true });
      },
    },
  ),
);
