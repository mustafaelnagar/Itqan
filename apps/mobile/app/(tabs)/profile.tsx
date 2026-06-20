import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Screen, Text, spacing, useTheme } from '@itqan/design-system';
import { env } from '@/config/env';
import { ReciterPicker } from '@/components/ReciterPicker';
import { useReaderSettings, type ThemePreference } from '@/stores/readerSettings';
import { useLanguageSettings } from '@/stores/languageSettings';
import { LANGUAGES, useLocale } from '@/i18n';
import { getReciter } from '@/audio/reciters';
import { clearCache, getCacheSize } from '@/audio/downloadManager';
import { formatBytes } from '@/lib/format';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useLocale();
  const { preferredReciterId, themePreference, setThemePreference } = useReaderSettings();
  const { lang, setLang } = useLanguageSettings();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cacheBytes, setCacheBytes] = useState(0);

  const refreshCache = useCallback(() => {
    void getCacheSize().then(setCacheBytes);
  }, []);
  useFocusEffect(refreshCache);

  const themeLabel: Record<ThemePreference, string> = {
    system: t.theme_system,
    light: t.theme_light,
    dark: t.theme_dark,
  };

  return (
    <Screen scroll>
      <Text variant="title">{t.profile_title}</Text>

      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
          {t.profile_recitation}
        </Text>
        <Pressable style={styles.row} onPress={() => setPickerOpen(true)}>
          <Text variant="body">{t.profile_reciter}</Text>
          <Text variant="body" color={theme.colors.primary}>
            {getReciter(preferredReciterId).name}
          </Text>
        </Pressable>
      </Card>

      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
          {t.profile_language}
        </Text>
        <View style={{ gap: spacing.xs }}>
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <Pressable
                key={l.code}
                onPress={() => setLang(l.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={l.englishName}
                style={[
                  styles.langRow,
                  {
                    backgroundColor: active ? theme.colors.surfaceElevated : theme.colors.surface,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text variant="body" color={active ? theme.colors.primary : theme.colors.text}>
                  {l.nativeName}
                </Text>
                {active ? (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
          {t.profile_appearance}
        </Text>
        <View style={styles.segment}>
          {THEME_OPTIONS.map((opt) => {
            const active = opt === themePreference;
            return (
              <Pressable
                key={opt}
                onPress={() => setThemePreference(opt)}
                style={[
                  styles.segmentItem,
                  {
                    backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  color={active ? theme.colors.primaryContrast : theme.colors.text}
                >
                  {themeLabel[opt]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
          {t.profile_downloaded_audio}
        </Text>
        <Text variant="body" muted style={{ marginBottom: spacing.md }}>
          {cacheBytes > 0 ? formatBytes(cacheBytes) : t.profile_nothing_downloaded}
        </Text>
        {cacheBytes > 0 ? (
          <Button
            label={t.profile_clear_audio}
            variant="secondary"
            onPress={async () => {
              await clearCache();
              refreshCache();
            }}
          />
        ) : null}
      </Card>

      <Card>
        <Text variant="bodyStrong" style={{ marginBottom: spacing.sm }}>
          {t.profile_privacy}
        </Text>
        <View style={{ gap: spacing.xs }}>
          <Text variant="body" muted>
            • {t.profile_privacy_1}
          </Text>
          <Text variant="body" muted>
            • {t.profile_privacy_2}
          </Text>
          <Text variant="body" muted>
            • {t.profile_privacy_3}
          </Text>
        </View>
        <Pressable
          style={[styles.policyLink, { borderTopColor: theme.colors.border }]}
          onPress={() => router.push('/policy')}
        >
          <Text variant="body" color={theme.colors.primary}>
            {t.profile_view_policy}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
        </Pressable>
      </Card>

      <Text variant="label" muted style={{ textAlign: 'center' }}>
        Itqān v0.1.0 · {env.appEnv}
      </Text>

      <ReciterPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
