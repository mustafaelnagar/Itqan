import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  Card,
  Screen,
  Text,
  fontFamily,
  gradients,
  radius,
  spacing,
  useResponsive,
  useTheme,
} from '@itqan/design-system';
import { ModeCard } from '@/components/ModeCard';
import { useLastPosition } from '@/stores/lastPosition';
import { useActivePlan, useDueCount, useOverallStats } from '@/features/hifz/hooks';
import { useLocale } from '@/i18n';

/**
 * Home — a vibrant landing that makes the three modes obvious and the day's
 * focus clear. Laid out to fit a single screen (no scroll) on phone, tablet, and
 * desktop: a compact, centered hero on top, a mode grid that flexes to fill the
 * remaining height, and a quiet duʿāʾ footer.
 */
export default function HomeScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const { isDesktop } = useResponsive();
  // RNW writes `flex-direction: row` literally and doesn't mirror it under an
  // RTL document, so rows whose child order is meaningful must flip explicitly.
  const rowDir = isRTL ? ('row-reverse' as const) : ('row' as const);
  const position = useLastPosition((s) => s.position);
  const { data: stats } = useOverallStats();
  const { data: dueCount } = useDueCount();
  const { data: plan } = useActivePlan();

  const todayLine =
    (dueCount ?? 0) > 0
      ? t.home_due(dueCount ?? 0)
      : plan
        ? t.home_continue_plan(plan.title)
        : t.home_set_goal;

  const modes = [
    {
      key: 'mushaf',
      title: t.mode_mushaf_title,
      subtitle: t.mode_mushaf_subtitle,
      arabic: 'ٱلْمُصْحَف',
      icon: 'book' as const,
      gradient: gradients.mushaf,
      onPress: () => router.push('/mushaf'),
    },
    {
      key: 'hifz',
      title: t.mode_hifz_title,
      subtitle: t.mode_hifz_subtitle,
      arabic: 'ٱلْحِفْظ',
      icon: 'school' as const,
      gradient: gradients.hifz,
      onPress: () => router.push('/hifz'),
    },
    {
      key: 'tasmi',
      title: t.mode_tasmi_title,
      subtitle: t.mode_tasmi_subtitle,
      arabic: 'ٱلتَّسْمِيع',
      icon: 'mic' as const,
      gradient: gradients.tasmi,
      onPress: () => router.push('/tasmi'),
    },
    {
      key: 'review',
      title: t.mode_review_title,
      subtitle: t.mode_review_subtitle,
      arabic: 'ٱلْمُرَاجَعَة',
      icon: 'refresh' as const,
      gradient: gradients.review,
      onPress: () => router.push('/hifz'),
    },
  ];

  // 4-up single row on desktop; two rows of two on phone/tablet.
  const rows = isDesktop ? [modes] : [modes.slice(0, 2), modes.slice(2, 4)];

  return (
    // Desktop/tablet fit a single fixed screen; phones scroll so the mode-card
    // titles are never squeezed off by the hero on short viewports.
    <Screen edgeToEdge scroll={!isDesktop}>
      <View style={[styles.pad, isDesktop && styles.flex1]}>
        {/* Hero */}
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <RNText style={styles.heroMotif}>۞</RNText>

          <Text variant="caption" color="rgba(255,255,255,0.85)" style={styles.center}>
            {t.home_greeting}
          </Text>
          <View style={[styles.brandRow, { flexDirection: rowDir }]}>
            <Text variant="display" color="#FFFFFF">
              Itqān
            </Text>
            <RNText style={styles.brandArabic}>إِتْقَان</RNText>
          </View>
          <Text variant="body" color="rgba(255,255,255,0.92)" style={styles.center}>
            {todayLine}
          </Text>

          <View style={[styles.stats, { flexDirection: rowDir }]}>
            <Stat label={t.home_stat_memorized} value={stats?.memorizedAyat ?? 0} />
            <View style={styles.statDivider} />
            <Stat label={t.home_stat_weak} value={stats?.weakAyat ?? 0} />
            <View style={styles.statDivider} />
            <Stat label={t.home_stat_due} value={dueCount ?? 0} />
          </View>

          <Pressable
            onPress={() => router.push('/hifz')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, { flexDirection: rowDir, opacity: pressed ? 0.92 : 1 }]}
          >
            <Text variant="bodyStrong" color={theme.colors.primary}>
              {t.home_start_hifz}
            </Text>
            <Ionicons
              name={isRTL ? 'arrow-back' : 'arrow-forward'}
              size={18}
              color={theme.colors.primary}
            />
          </Pressable>
        </LinearGradient>

        {/* Modes — fill the remaining height on desktop; natural height on phone */}
        <View style={[styles.middle, isDesktop && styles.flex1]}>
          <Text variant="heading" style={styles.sectionTitle}>
            {t.home_choose_path}
          </Text>
          <View style={[styles.gridWrap, isDesktop && styles.flex1]}>
            {rows.map((row, i) => (
              <View
                key={i}
                style={[styles.gridRow, isDesktop && styles.flex1, { flexDirection: rowDir }]}
              >
                {/* In Arabic UI the title is already Arabic, so the decorative
                    watermark would just duplicate/overlap it — show it only in LTR. */}
                {row.map((m) => (
                  <ModeCard
                    key={m.key}
                    title={m.title}
                    subtitle={m.subtitle}
                    arabic={isRTL ? undefined : m.arabic}
                    icon={m.icon}
                    gradient={m.gradient}
                    fill={isDesktop}
                    onPress={m.onPress}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Continue reading */}
        {position ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/surah/[number]', params: { number: position.surah } })
            }
          >
            <Card style={styles.continueCard}>
              <View style={[styles.continueRow, { flexDirection: rowDir }]}>
                <Ionicons name="bookmark" size={20} color={theme.colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text variant="label" muted>
                    {t.home_continue_reading}
                  </Text>
                  <Text variant="bodyStrong">
                    {position.surahName} · {t.home_ayah(position.ayah)}
                  </Text>
                </View>
                <Ionicons
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={20}
                  color={theme.colors.textMuted}
                />
              </View>
            </Card>
          </Pressable>
        ) : null}

        <Text variant="label" quran color={theme.colors.textMuted} style={styles.dua}>
          اللّٰهُمَّ ٱجْعَلِ ٱلْقُرْآنَ رَبِيعَ قَلْبِي
        </Text>
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text variant="title" color="#FFFFFF">
        {value}
      </Text>
      <Text variant="label" color="rgba(255,255,255,0.8)">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  pad: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  hero: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroMotif: {
    position: 'absolute',
    top: -28,
    right: -20,
    fontSize: 150,
    color: 'rgba(255,255,255,0.10)',
    fontFamily: fontFamily.quran,
  },
  center: { textAlign: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  brandArabic: { fontSize: 30, color: 'rgba(255,255,255,0.9)', fontFamily: fontFamily.quran },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
  },
  stat: { alignItems: 'center', minWidth: 56 },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.lg,
    marginTop: spacing.sm,
    alignSelf: 'center',
    minWidth: 240,
  },
  middle: { gap: spacing.sm },
  sectionTitle: {},
  gridWrap: { gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  continueCard: { paddingVertical: spacing.md },
  continueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dua: {
    textAlign: 'center',
    fontFamily: fontFamily.quran,
    fontSize: 16,
  },
});
