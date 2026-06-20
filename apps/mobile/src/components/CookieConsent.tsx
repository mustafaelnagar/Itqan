import { Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, radius, spacing, useTheme } from '@itqan/design-system';
import { useCookieConsent } from '@/stores/cookieConsent';
import { useT } from '@/i18n';

/**
 * One-time notice (web only) that Itqān stores selections in the browser. Sits
 * above the bottom nav and disappears for good once acknowledged.
 */
export function CookieConsent() {
  const theme = useTheme();
  const t = useT();
  const accepted = useCookieConsent((s) => s.accepted);
  const hydrated = useCookieConsent((s) => s.hydrated);
  const accept = useCookieConsent((s) => s.accept);

  if (Platform.OS !== 'web' || !hydrated || accepted) return null;

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.surfaceElevated }}>
      <View style={[styles.card, { borderTopColor: theme.colors.border }]}>
        <Text variant="body" style={styles.text}>
          {t.cookie_banner_text}
        </Text>
        <View style={styles.actions}>
          <Button
            label={t.cookie_banner_learn_more}
            variant="secondary"
            onPress={() => router.push('/policy')}
          />
          <Button label={t.cookie_banner_accept} onPress={accept} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
  },
  text: { lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
