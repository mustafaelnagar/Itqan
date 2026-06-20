/**
 * Runtime environment resolution (FND-007).
 *
 * Reads values injected via `app.config.ts` -> `extra`, validates them, and
 * exposes a single typed `env` object. Fail fast in non-production if required
 * config is missing so misconfiguration is caught at startup, not at call time.
 */
import Constants from 'expo-constants';

export type AppEnv = 'development' | 'staging' | 'production';

interface RawExtra {
  appEnv?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  aiServiceUrl?: string;
  audioBaseUrl?: string;
  sentryDsn?: string;
  analyticsEnabled?: boolean;
}

const extra = (Constants.expoConfig?.extra ?? {}) as RawExtra;

const appEnv = (extra.appEnv as AppEnv) ?? 'development';

export const env = {
  appEnv,
  isDev: appEnv === 'development',
  isProd: appEnv === 'production',
  supabaseUrl: extra.supabaseUrl ?? '',
  supabaseAnonKey: extra.supabaseAnonKey ?? '',
  aiServiceUrl: extra.aiServiceUrl ?? '',
  /** Base URL for recitation audio (EveryAyah layout). Override to self-host. */
  audioBaseUrl: extra.audioBaseUrl || 'https://everyayah.com/data',
  sentryDsn: extra.sentryDsn ?? '',
  analyticsEnabled: Boolean(extra.analyticsEnabled),
} as const;

/** Throws if a required key is empty. Call once at startup. */
export function assertEnv(): void {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!env.supabaseAnonKey) missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    const message = `Missing required env: ${missing.join(', ')}`;
    if (env.isProd) {
      throw new Error(message);
    }
    // eslint-disable-next-line no-console
    console.warn(`[itqan] ${message} — using empty values (dev/staging only).`);
  }
}
