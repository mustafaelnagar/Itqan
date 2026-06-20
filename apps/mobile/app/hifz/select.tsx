import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, fontFamily, radius, spacing, useTheme } from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SurahPicker } from '@/components/SurahPicker';
import { Stepper } from '@/components/Stepper';
import { useSurahs } from '@/features/quran/hooks';
import type { SurahRow } from '@/db/repositories/quranRepo';
import { useLocale } from '@/i18n';
import { toArabicNumerals } from '@/lib/format';

/** HIFZ-001: choose a surah + ayah range to memorize, then start a session. */
export default function SelectPassageScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const { data: surahs } = useSurahs();
  const [picker, setPicker] = useState(false);
  const [surah, setSurah] = useState<SurahRow | null>(null);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(5);

  // Default to the first surah once data loads.
  useEffect(() => {
    if (!surah && surahs?.length) {
      setSurah(surahs[0]!);
      setTo(Math.min(5, surahs[0]!.ayahCount));
    }
  }, [surahs, surah]);

  const max = surah?.ayahCount ?? 1;

  // Keep the range inside the surah whenever the surah (and thus max) changes —
  // you can never select an ayah beyond what the surah actually has.
  useEffect(() => {
    setFrom((f) => Math.min(Math.max(f, 1), max));
    setTo((tv) => Math.min(Math.max(tv, 1), max));
  }, [max]);

  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const count = hi - lo + 1;
  const num = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  const start = () => {
    if (!surah) return;
    router.replace({
      pathname: '/hifz/session',
      params: {
        first: `${surah.number}:${lo}`,
        last: `${surah.number}:${hi}`,
        title: `${surah.nameSimple} ${lo}–${hi}`,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader title={t.select_title} />
      <View style={styles.body}>
        {/* Surah */}
        <Card>
          <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
            {t.select_surah}
          </Text>
          <Pressable style={styles.pickRow} onPress={() => setPicker(true)}>
            <View style={styles.pickLeft}>
              <View style={[styles.badge, { borderColor: theme.colors.border }]}>
                <Text variant="caption" color={theme.colors.primary}>
                  {surah ? num(surah.number) : '—'}
                </Text>
              </View>
              <Text variant="bodyStrong">{surah ? surah.nameSimple : t.common_choose}</Text>
            </View>
            <View style={styles.pickRight}>
              {surah ? (
                <RNText style={[styles.arabicName, { color: theme.colors.primary }]}>
                  {surah.nameArabic}
                </RNText>
              ) : null}
              <Ionicons name="chevron-expand" size={18} color={theme.colors.textMuted} />
            </View>
          </Pressable>
        </Card>

        {/* Range */}
        <Card>
          <View style={{ gap: spacing.lg }}>
            <Stepper label={t.select_from_ayah} value={from} min={1} max={max} onChange={setFrom} />
            <View
              style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }}
            />
            <Stepper label={t.select_to_ayah} value={to} min={1} max={max} onChange={setTo} />
          </View>
        </Card>

        {/* Live preview of the chosen passage */}
        {surah ? (
          <View
            style={[
              styles.preview,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.accent },
            ]}
          >
            <Ionicons name="bookmarks-outline" size={18} color={theme.colors.accent} />
            <Text variant="bodyStrong">
              {surah.nameSimple} · {num(lo)}–{num(hi)}
            </Text>
            <Text variant="caption" muted>
              {t.ayat_count(count)}
            </Text>
          </View>
        ) : null}

        <Button label={t.select_start_session} fullWidth onPress={start} />
      </View>

      <SurahPicker
        visible={picker}
        onClose={() => setPicker(false)}
        onSelect={(s) => {
          setSurah(s);
          setFrom(1);
          setTo(Math.min(5, s.ayahCount));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg },
  pickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  pickRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicName: { fontFamily: fontFamily.quran, fontSize: 20, writingDirection: 'rtl' },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
