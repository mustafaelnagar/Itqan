/**
 * Cookie / local-storage consent (web).
 *
 * Persisted like every other selection — so the acknowledgement itself is stored
 * in localStorage and a long-lived first-party cookie, and the banner stays gone
 * across sessions. `hydrated` guards the banner until persistence has loaded.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { asyncStorage } from './persist';

interface CookieConsentState {
  accepted: boolean;
  hydrated: boolean;
  accept: () => void;
}

export const useCookieConsent = create<CookieConsentState>()(
  persist(
    (set) => ({
      accepted: false,
      hydrated: false,
      accept: () => set({ accepted: true }),
    }),
    {
      name: 'itqan.cookie-consent',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (s) => ({ accepted: s.accepted }),
      onRehydrateStorage: () => () => useCookieConsent.setState({ hydrated: true }),
    },
  ),
);
