import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Text,
  fontFamily,
  fontSize,
  lineHeight,
  radius,
  spacing,
  useContentMaxWidth,
  useTheme,
} from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AudioBar } from '@/components/AudioBar';
import { AyahSkeleton } from '@/components/Skeleton';
import { Stepper } from '@/components/Stepper';
import { RangeBar } from '@/components/RangeBar';
import { useQuery } from '@tanstack/react-query';
import { getAyahsBetween, type AyahRow } from '@/db/repositories/quranRepo';
import { useMarkAyah, useCompletePlanItem } from '@/features/hifz/hooks';
import type { Mark } from '@/features/hifz/scoring';
import { useReaderSettings } from '@/stores/readerSettings';
import { useHifzSettings } from '@/stores/hifzSettings';
import { usePlayback } from '@/stores/playback';
import { playQueue } from '@/audio/player';
import { toArabicNumerals } from '@/lib/format';
import { useLocale, type Dictionary } from '@/i18n';

type Reveal = 'full' | 'hint' | 'hidden';
const REVEAL_ORDER: Reveal[] = ['full', 'hint', 'hidden'];
const revealLabel = (t: Dictionary, r: Reveal) =>
  r === 'full' ? t.reveal_full : r === 'hint' ? t.reveal_hint : t.reveal_hidden;

const MARK_COLORS = (t: ReturnType<typeof useTheme>): Record<Mark, string> => ({
  weak: t.colors.danger,
  good: t.colors.warning,
  strong: t.colors.success,
});

export default function HifzSessionScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const params = useLocalSearchParams<{
    first: string;
    last: string;
    title?: string;
    itemId?: string;
    planId?: string;
  }>();
  const { translationEdition } = useReaderSettings();
  const { sessionRepeats } = useHifzSettings();
  const currentAyahKey = usePlayback((s) => s.currentAyahKey);

  const [reveal, setReveal] = useState<Reveal>('full');
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const maxWidth = useContentMaxWidth('reading');

  const { data: ayahs, isLoading } = useQuery({
    queryKey: ['hifzRange', params.first, params.last, translationEdition],
    queryFn: () => getAyahsBetween(params.first, params.last, translationEdition),
    enabled: !!params.first && !!params.last,
  });

  const markAyah = useMarkAyah();
  const completeItem = useCompletePlanItem(params.planId);

  const title = params.title ?? t.session_default_title;

  // Which ayāt of the passage to loop. Positions (1…count) into the passage, so it
  // works even if the range spans surahs. Defaults to the whole passage.
  const passageLen = ayahs?.length ?? 0;
  const [repeatFrom, setRepeatFrom] = useState(1);
  const [repeatTo, setRepeatTo] = useState(1);
  useEffect(() => {
    setRepeatFrom(1);
    setRepeatTo(Math.max(1, passageLen));
  }, [passageLen]);
  const repLo = Math.min(repeatFrom, repeatTo);
  const repHi = Math.max(repeatFrom, repeatTo);

  const listen = useCallback(() => {
    if (!ayahs?.length) return;
    usePlayback.getState().setRepeatMode('one');
    usePlayback.getState().setRepeatCount(sessionRepeats);
    void playQueue(ayahs.map((a) => ({ key: a.key, surah: a.surah, ayah: a.ayah })));
  }, [ayahs, sessionRepeats]);

  // Loop the entire passage end-to-end (range repeat) — for cementing a full lesson.
  const repeatLesson = useCallback(() => {
    if (!ayahs?.length) return;
    usePlayback.getState().setRepeatMode('range');
    usePlayback.getState().setRepeatCount(sessionRepeats);
    void playQueue(ayahs.map((a) => ({ key: a.key, surah: a.surah, ayah: a.ayah })));
  }, [ayahs, sessionRepeats]);

  // Loop only the ayāt the hafiz selected with the from→to range below.
  const repeatSelected = useCallback(() => {
    if (!ayahs?.length) return;
    const slice = ayahs.slice(repLo - 1, repHi);
    if (!slice.length) return;
    usePlayback.getState().setRepeatMode('range');
    usePlayback.getState().setRepeatCount(sessionRepeats);
    void playQueue(slice.map((a) => ({ key: a.key, surah: a.surah, ayah: a.ayah })));
  }, [ayahs, sessionRepeats, repLo, repHi]);

  const onMark = useCallback(
    (ayah: AyahRow, mark: Mark) => {
      setMarks((m) => ({ ...m, [ayah.key]: mark }));
      markAyah.mutate({
        ayah: { key: ayah.key, surah: ayah.surah, page: ayah.page, juz: ayah.juz },
        mark,
      });
    },
    [markAyah],
  );

  const total = ayahs?.length ?? 0;
  const markedCount = Object.keys(marks).length;
  const progress = total > 0 ? markedCount / total : 0;

  const finish = useCallback(() => {
    if (params.itemId) completeItem.mutate(params.itemId);
    router.back();
  }, [params.itemId, completeItem]);

  const header = useMemo(
    () => (
      <Card style={{ marginBottom: spacing.lg }}>
        <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
          {t.session_memorize_layer}
        </Text>
        <View style={styles.segment}>
          {REVEAL_ORDER.map((r) => {
            const active = r === reveal;
            return (
              <Pressable
                key={r}
                onPress={() => setReveal(r)}
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
                  {revealLabel(t, r)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button
          label={t.session_listen(sessionRepeats)}
          onPress={listen}
          leading={<Ionicons name="play" size={16} color={theme.colors.primaryContrast} />}
          style={{ marginTop: spacing.md }}
        />
        <Button
          label={t.session_repeat_lesson}
          variant="secondary"
          onPress={repeatLesson}
          leading={<Ionicons name="repeat" size={16} color={theme.colors.text} />}
          style={{ marginTop: spacing.sm }}
        />

        {/* Customize which ayāt to loop — a from→to range over the passage. */}
        {passageLen > 1 ? (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            <Text variant="label" muted>
              {t.session_repeat_range_label}
            </Text>
            <Stepper label={t.select_from_ayah} value={repeatFrom} min={1} max={passageLen} onChange={setRepeatFrom} />
            <Stepper label={t.select_to_ayah} value={repeatTo} min={1} max={passageLen} onChange={setRepeatTo} />
            <RangeBar min={1} max={passageLen} lo={repLo} hi={repHi} />
            <Button
              label={t.session_repeat_selected}
              variant="secondary"
              onPress={repeatSelected}
              leading={<Ionicons name="repeat" size={16} color={theme.colors.text} />}
              style={{ marginTop: spacing.xs }}
            />
          </View>
        ) : null}

        <Text variant="caption" muted style={{ marginTop: spacing.sm }}>
          {t.session_tip}
        </Text>

        {/* Memorization progress — how much of the passage you've marked. */}
        <View
          style={[styles.track, { backgroundColor: theme.colors.border, marginTop: spacing.md }]}
        >
          <View
            style={[
              styles.fill,
              {
                backgroundColor: theme.colors.memory.strong,
                width: `${Math.round(progress * 100)}%`,
              },
            ]}
          />
        </View>
      </Card>
    ),
    [
      reveal,
      theme,
      sessionRepeats,
      listen,
      repeatLesson,
      repeatSelected,
      passageLen,
      repeatFrom,
      repeatTo,
      repLo,
      repHi,
      t,
      progress,
    ],
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader
        title={title}
        subtitle={ayahs ? t.session_subtitle(ayahs.length, markedCount) : undefined}
        right={
          <Pressable onPress={finish} hitSlop={8}>
            <Text variant="bodyStrong" color={theme.colors.primary}>
              {t.common_finish}
            </Text>
          </Pressable>
        }
      />
      {isLoading ? (
        <View style={{ paddingHorizontal: spacing.xl }}>
          <AyahSkeleton />
          <AyahSkeleton />
        </View>
      ) : (
        <FlatList
          style={{ width: '100%', maxWidth, alignSelf: 'center' }}
          data={ayahs ?? []}
          keyExtractor={(a) => a.key}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <HifzAyah
              ayah={item}
              reveal={reveal}
              mark={marks[item.key]}
              isCurrent={item.key === currentAyahKey}
              isRTL={isRTL}
              t={t}
              onMark={(m) => onMark(item, m)}
            />
          )}
        />
      )}
      <AudioBar />
    </SafeAreaView>
  );
}

function HifzAyah({
  ayah,
  reveal,
  mark,
  isCurrent,
  isRTL,
  t,
  onMark,
}: {
  ayah: AyahRow;
  reveal: Reveal;
  mark?: Mark;
  isCurrent: boolean;
  isRTL: boolean;
  t: Dictionary;
  onMark: (m: Mark) => void;
}) {
  const theme = useTheme();
  const colors = MARK_COLORS(theme);
  const markLabel = (m: Mark) =>
    m === 'weak' ? t.mark_weak : m === 'good' ? t.mark_good : t.mark_strong;

  const shown =
    reveal === 'full'
      ? ayah.text
      : reveal === 'hint'
        ? `${ayah.text.split(' ')[0] ?? ''} …`
        : '• • • • •';

  // A colored edge encodes the ayah's strength — a tiny "living map" cue.
  const edge = mark ? colors[mark] : 'transparent';

  return (
    <View
      style={[
        styles.ayah,
        { borderBottomColor: theme.colors.border },
        isCurrent
          ? { backgroundColor: theme.colors.highlightSoft, borderBottomColor: 'transparent' }
          : null,
        isRTL
          ? { borderRightWidth: 3, borderRightColor: edge }
          : { borderLeftWidth: 3, borderLeftColor: edge },
      ]}
    >
      <View
        style={[
          styles.badge,
          { alignSelf: isRTL ? 'flex-end' : 'flex-start', backgroundColor: theme.colors.primary },
        ]}
      >
        <Text variant="label" color={theme.colors.primaryContrast}>
          {t.ayah_n(isRTL ? toArabicNumerals(ayah.ayah) : ayah.ayah)}
        </Text>
      </View>
      <RNText
        style={[
          styles.arabic,
          { color: reveal === 'hidden' ? theme.colors.textMuted : theme.colors.text },
        ]}
      >
        {shown}
      </RNText>
      <View style={styles.marks}>
        {(['weak', 'good', 'strong'] as Mark[]).map((m) => {
          const active = mark === m;
          return (
            <Pressable
              key={m}
              onPress={() => onMark(m)}
              style={[
                styles.markBtn,
                { borderColor: colors[m], backgroundColor: active ? colors[m] : 'transparent' },
              ]}
            >
              <Text variant="label" color={active ? theme.colors.primaryContrast : colors[m]}>
                {markLabel(m)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] * 1.5 },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  track: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: 8, borderRadius: radius.full },
  ayah: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
  },
  badge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabic: {
    fontFamily: fontFamily.quran,
    fontSize: fontSize.quranMd,
    lineHeight: fontSize.quranMd * lineHeight.quran,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  marks: { flexDirection: 'row', gap: spacing.sm },
  markBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
