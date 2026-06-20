import { useState } from 'react';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Text,
  fontFamily,
  fontSize,
  lineHeight,
  radius,
  spacing,
  useTheme,
} from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Bismillah, Ornament, OrnateFrame } from '@/components/Ornament';
import { useDueReview, useMarkAyah } from '@/features/hifz/hooks';
import type { Mark } from '@/features/hifz/scoring';
import { playQueue } from '@/audio/player';
import { toArabicNumerals } from '@/lib/format';
import { useLocale } from '@/i18n';

/**
 * Daily murājaʿah — active-recall review of due ayāt. Each ayah is hidden first
 * (recite from memory), then revealed and self-graded; the grade reschedules it
 * through the spaced-repetition engine.
 */
export default function ReviewScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const { data: items, isLoading } = useDueReview(40);
  const markAyah = useMarkAyah();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const total = items?.length ?? 0;
  const current = items?.[index];
  const num = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  const grade = (mark: Mark) => {
    if (!current) return;
    markAyah.mutate({
      ayah: { key: current.key, surah: current.surah, page: current.page, juz: current.juz },
      mark,
    });
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  const done = !isLoading && (total === 0 || index >= total);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader
        title={t.review_title}
        subtitle={!done && total > 0 ? t.review_progress(Math.min(index + 1, total), total) : undefined}
      />

      {done ? (
        <View style={styles.center}>
          <Bismillah />
          <Text variant="bodyStrong" style={{ textAlign: 'center', marginTop: spacing.lg }}>
            {total === 0 ? t.review_caught_up : t.review_complete}
          </Text>
          <Button label={t.common_finish} onPress={() => router.back()} style={{ marginTop: spacing.xl }} />
        </View>
      ) : current ? (
        <View style={styles.body}>
          {/* Progress rail */}
          <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: theme.colors.accent, width: `${Math.round((index / total) * 100)}%` },
              ]}
            />
          </View>

          <OrnateFrame style={styles.frame}>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="label" color={theme.colors.primaryContrast}>
                {t.surah_fallback(current.surah)} · {t.ayah_n(num(current.ayah))}
              </Text>
            </View>

            <Ornament style={{ marginVertical: spacing.md }} />

            {revealed ? (
              <RNText style={[styles.arabic, { color: theme.colors.text }]}>{current.text}</RNText>
            ) : (
              <Pressable onPress={() => setRevealed(true)} style={styles.hidden}>
                <RNText style={[styles.arabic, { color: theme.colors.textMuted }]}>۞ ۞ ۞</RNText>
                <Text variant="caption" muted style={{ marginTop: spacing.md, textAlign: 'center' }}>
                  {t.review_recall_prompt}
                </Text>
              </Pressable>
            )}

            <Ornament style={{ marginTop: spacing.md }} />
          </OrnateFrame>

          {/* Listen aid */}
          <Button
            label={t.review_listen}
            variant="ghost"
            leading={<Ionicons name="play" size={16} color={theme.colors.primary} />}
            onPress={() =>
              void playQueue([{ key: current.key, surah: current.surah, ayah: current.ayah }])
            }
          />

          {/* Reveal → grade */}
          {revealed ? (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption" muted style={{ textAlign: 'center' }}>
                {t.review_grade_prompt}
              </Text>
              <View style={styles.grades}>
                {(['weak', 'good', 'strong'] as Mark[]).map((m) => {
                  const color =
                    m === 'weak'
                      ? theme.colors.danger
                      : m === 'good'
                        ? theme.colors.warning
                        : theme.colors.success;
                  const label = m === 'weak' ? t.mark_weak : m === 'good' ? t.mark_good : t.mark_strong;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => grade(m)}
                      style={[styles.grade, { borderColor: color }]}
                    >
                      <Text variant="bodyStrong" color={color}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <Button label={t.review_show_ayah} fullWidth onPress={() => setRevealed(true)} />
          )}
        </View>
      ) : (
        <View style={styles.center}>
          <Text variant="caption" muted>
            {t.common_loading}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  track: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.full },
  frame: { minHeight: 220, justifyContent: 'center' },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  arabic: {
    fontFamily: fontFamily.quran,
    fontSize: fontSize.quranMd,
    lineHeight: fontSize.quranMd * lineHeight.quran,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  hidden: { alignItems: 'center', paddingVertical: spacing.lg },
  grades: { flexDirection: 'row', gap: spacing.sm },
  grade: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
});
