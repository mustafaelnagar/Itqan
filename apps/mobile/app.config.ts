import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Environment-aware Expo config (FND-007).
 *
 * `APP_ENV` selects the variant. Each variant gets its own name, bundle id, and
 * scheme so dev/staging/prod builds can coexist on one device. Public runtime
 * values are exposed through `extra` and read by `src/config/env.ts`.
 */
type AppEnv = 'development' | 'staging' | 'production';

const APP_ENV = (process.env.APP_ENV as AppEnv) || 'development';

const variants: Record<AppEnv, { name: string; idSuffix: string; scheme: string }> = {
  development: { name: 'Itqān (Dev)', idSuffix: '.dev', scheme: 'itqan-dev' },
  staging: { name: 'Itqān (Staging)', idSuffix: '.staging', scheme: 'itqan-staging' },
  production: { name: 'Itqān', idSuffix: '', scheme: 'itqan' },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = variants[APP_ENV];
  const baseId = 'app.itqan';

  return {
    ...config,
    name: variant.name,
    slug: 'itqan',
    scheme: variant.scheme,
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: `${baseId}${variant.idSuffix}`,
      infoPlist: {
        // AUD-005: keep audio playing when the app is backgrounded.
        UIBackgroundModes: ['audio'],
      },
    },
    android: {
      package: `${baseId}${variant.idSuffix}`,
      // Streaming + downloading recitation audio requires network access.
      permissions: ['INTERNET'],
    },
    web: {
      bundler: 'metro',
      // SPA (client-rendered): this is an interactive, stateful app, not a static
      // site, so skip Node prerendering (which lacks window/native modules).
      output: 'single',
    },
    plugins: ['expo-router', 'expo-font', 'expo-secure-store'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      appEnv: APP_ENV,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
      aiServiceUrl: process.env.EXPO_PUBLIC_AI_SERVICE_URL ?? '',
      audioBaseUrl: process.env.EXPO_PUBLIC_AUDIO_BASE_URL ?? '',
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
      analyticsEnabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
    },
  };
};
