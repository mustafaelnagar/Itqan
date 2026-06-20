import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, spacing, useTheme } from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { cookies } from '@/lib/cookies';
import { useT } from '@/i18n';

/** Privacy & storage policy — explains the local-only cookies/storage model. */
export default function PolicyScreen() {
  const theme = useTheme();
  const t = useT();
  const [cleared, setCleared] = useState(false);

  // Wipe everything Itqān saved on this device: the persisted selection stores in
  // localStorage and their first-party cookie mirrors.
  const clearSavedData = () => {
    if (Platform.OS === 'web') {
      const store = (() => {
        try {
          return globalThis.localStorage ?? null;
        } catch {
          return null;
        }
      })();
      const names: string[] = [];
      for (let i = 0; i < (store?.length ?? 0); i++) {
        const key = store!.key(i);
        if (key?.startsWith('itqan.')) names.push(key);
      }
      for (const name of names) {
        store?.removeItem(name);
        cookies.remove(name);
      }
    }
    setCleared(true);
  };

  const SECTIONS: { title: string; body: string }[] = [
    { title: t.policy_storage_title, body: t.policy_storage_body },
    { title: t.policy_cookies_title, body: t.policy_cookies_body },
    { title: t.policy_retention_title, body: t.policy_retention_body },
    { title: t.policy_control_title, body: t.policy_control_body },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScreenHeader title={t.policy_title} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text variant="body" muted style={styles.intro}>
          {t.policy_intro}
        </Text>

        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <Text variant="bodyStrong" style={{ marginBottom: spacing.xs }}>
              {s.title}
            </Text>
            <Text variant="body" muted style={styles.para}>
              {s.body}
            </Text>
          </Card>
        ))}

        {Platform.OS === 'web' ? (
          <View style={{ gap: spacing.sm }}>
            <Button label={t.policy_clear_button} variant="secondary" onPress={clearSavedData} />
            {cleared ? (
              <Text variant="caption" muted style={{ textAlign: 'center' }}>
                {t.policy_clear_done}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  intro: { lineHeight: 22, marginBottom: spacing.xs },
  para: { lineHeight: 22 },
});
