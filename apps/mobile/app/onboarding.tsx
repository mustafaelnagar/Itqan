import { Pressable, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  Screen,
  Text,
  fontFamily,
  gradients,
  radius,
  spacing,
  useTheme,
} from '@itqan/design-system';
import { LANGUAGES, useLocale } from '@/i18n';
import { useLanguageSettings } from '@/stores/languageSettings';

/**
 * First-launch language picker. Shown once, before the app proper, so every
 * market starts in its own language and direction. Tapping a language applies
 * it live (the whole tree re-renders); "Continue" marks onboarding complete and
 * enters the app. The choice is never locked in — it can be changed any time
 * from Profile → Language.
 */
export default function OnboardingScreen() {
  const theme = useTheme();
  const { t, lang } = useLocale();
  const { onboarded, hydrated, setLang, setOnboarded } = useLanguageSettings();

  // A returning user who somehow lands here goes straight in.
  if (hydrated && onboarded) return <Redirect href="/" />;

  const finish = () => {
    setOnboarded(true);
    router.replace('/');
  };

  return (
    <Screen edgeToEdge>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <RNText style={styles.heroMotif}>۞</RNText>
          <View style={styles.brandRow}>
            <Text variant="display" color="#FFFFFF">
              Itqān
            </Text>
            <RNText style={styles.brandArabic}>إِتْقَان</RNText>
          </View>
          <Text variant="heading" color="#FFFFFF" style={styles.center}>
            {t.onboarding_welcome}
          </Text>
          <Text variant="body" color="rgba(255,255,255,0.9)" style={styles.center}>
            {t.onboarding_tagline}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <Text variant="heading">{t.onboarding_choose_language}</Text>
          <Text variant="body" muted>
            {t.onboarding_language_hint}
          </Text>

          <View style={styles.list}>
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
                      backgroundColor: active
                        ? theme.colors.surfaceElevated
                        : theme.colors.surface,
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.langText}>
                    <Text variant="bodyStrong" color={active ? theme.colors.primary : theme.colors.text}>
                      {l.nativeName}
                    </Text>
                    <Text variant="caption" muted>
                      {l.englishName}
                    </Text>
                  </View>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={22}
                      color={theme.colors.border}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Button label={t.onboarding_continue} onPress={finish} fullWidth size="lg" />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: spacing.xl },
  hero: {
    borderRadius: radius.xl,
    margin: spacing.lg,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroMotif: {
    position: 'absolute',
    top: -30,
    right: -20,
    fontSize: 160,
    color: 'rgba(255,255,255,0.10)',
    fontFamily: fontFamily.quran,
  },
  brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  brandArabic: { fontSize: 32, color: 'rgba(255,255,255,0.9)', fontFamily: fontFamily.quran },
  center: { textAlign: 'center' },
  body: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  list: { gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.lg },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  langText: { gap: 2 },
});
