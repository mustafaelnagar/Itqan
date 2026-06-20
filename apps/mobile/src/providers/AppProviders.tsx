import React, { useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { DirectionProvider, ThemeProvider } from '@itqan/design-system';
import { setAnalyticsEnabled } from '@itqan/analytics';
import { logger } from '@itqan/logging';
import { assertEnv, env } from '../config/env';
import { queryClient } from '../lib/queryClient';
import { supabase } from '../lib/supabase';
import { getDb } from '../db/database';
import { runSync } from '../sync/syncService';
import { useReaderSettings } from '../stores/readerSettings';
import { useLocale } from '../i18n';

/** Root provider tree: env validation, theming, server state, DB init, sync. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const themePreference = useReaderSettings((s) => s.themePreference);
  const { dir, isRTL, lang } = useLocale();

  // Apply text direction app-wide. On web this flips the document; on native we
  // align I18nManager so RN layout primitives mirror (full flip needs a reload).
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', lang);
      }
    } else {
      I18nManager.allowRTL(isRTL);
      if (I18nManager.isRTL !== isRTL) I18nManager.forceRTL(isRTL);
    }
  }, [dir, isRTL, lang]);

  useEffect(() => {
    assertEnv();
    setAnalyticsEnabled(env.analyticsEnabled);
    logger.breadcrumb('app_providers_mounted', { appEnv: env.appEnv });

    // Open + seed the local content DB early so first reads are instant.
    void getDb().catch((err) => logger.captureException(err, { feature: 'db_init' }));
    // Opportunistic sync (no-op until signed in).
    void runSync();

    // Flush the offline queue whenever auth state changes (e.g. sign-in).
    const { data } = supabase.auth.onAuthStateChange(() => {
      void runSync();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider scheme={themePreference === 'system' ? undefined : themePreference}>
        <DirectionProvider dir={dir}>{children}</DirectionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
