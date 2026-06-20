/**
 * Browser cookie helpers.
 *
 * Used to persist the user's selections for a long time (default ~400 days — the
 * maximum lifetime modern browsers honor) and to remember cookie consent. All
 * cookies are first-party, `SameSite=Lax`, and `Secure` over HTTPS — they are
 * never shared and never used for advertising or tracking.
 */
export interface CookieJar {
  get(name: string): string | null;
  set(name: string, value: string, days?: number): void;
  remove(name: string): void;
}

const MAX_DAYS = 400;

export const cookies: CookieJar = {
  get(name) {
    if (typeof document === 'undefined') return null;
    const prefix = `${encodeURIComponent(name)}=`;
    for (const part of document.cookie.split('; ')) {
      if (part.startsWith(prefix)) return decodeURIComponent(part.slice(prefix.length));
    }
    return null;
  },
  set(name, value, days = MAX_DAYS) {
    if (typeof document === 'undefined') return;
    const maxAge = Math.round(Math.min(days, MAX_DAYS) * 24 * 60 * 60);
    const secure =
      typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  },
  remove(name) {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
  },
};
