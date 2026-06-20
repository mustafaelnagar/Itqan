/**
 * Cookie helpers (native stub).
 *
 * Cookies are a web concept; on native, selections persist via AsyncStorage, so
 * every method here is a no-op. The web implementation lives in `cookies.web.ts`
 * and Metro picks it automatically for the web bundle.
 */
export interface CookieJar {
  get(name: string): string | null;
  set(name: string, value: string, days?: number): void;
  remove(name: string): void;
}

export const cookies: CookieJar = {
  get: () => null,
  set: () => {},
  remove: () => {},
};
