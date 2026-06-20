import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useContentMaxWidth, useTheme } from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MushafLeaf } from '@/components/MushafLeaf';
import { AyahSkeleton } from '@/components/Skeleton';
import { AudioBar } from '@/components/AudioBar';
import { usePageAyahs, useSurahs } from '@/features/quran/hooks';
import { useReaderSettings } from '@/stores/readerSettings';
import { usePlayback } from '@/stores/playback';
import { playQueue } from '@/audio/player';
import { useT } from '@/i18n';

const TOTAL_PAGES = 604;
const clampPage = (p: number) => Math.min(Math.max(p, 1), TOTAL_PAGES);

/**
 * Single-page Mushaf reader with a printed-page feel: one leaf at a time, and
 * you turn pages by swiping — right for the next page, left for the previous,
 * the natural right-to-left flow of a muṣḥaf. Header arrows do the same for
 * mouse/keyboard. The page number stays in sync with the URL.
 */
export default function PageReaderScreen() {
  const theme = useTheme();
  const t = useT();
  const params = useLocalSearchParams<{ number: string }>();
  const [page, setPage] = useState(() => clampPage(Number(params.number) || 1));
  const maxWidth = useContentMaxWidth('reading');
  const wrapRef = useRef<View>(null);

  // Turn `delta` pages. A functional update stays correct from any closure
  // (gesture handlers or the header arrows) without re-binding each page change.
  const turn = useCallback((delta: number) => {
    setPage((cur) => {
      const p = clampPage(cur + delta);
      if (p !== cur) router.setParams({ number: String(p) });
      return p;
    });
  }, []);

  // Native swipe (touch): right → next page, left → previous — RTL muṣḥaf flow.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, g) =>
          Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (g.dx > 50) turn(1);
          else if (g.dx < -50) turn(-1);
        },
      }),
    [turn],
  );

  // Web swipe via pointer events (covers mouse-drag and touch on the web build).
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = wrapRef.current as unknown as HTMLElement | null;
    if (!node) return;
    let startX = 0;
    let startY = 0;
    let down = false;
    const onDown = (e: PointerEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      down = true;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1);
    };
    node.addEventListener('pointerdown', onDown);
    node.addEventListener('pointerup', onUp);
    return () => {
      node.removeEventListener('pointerdown', onDown);
      node.removeEventListener('pointerup', onUp);
    };
  }, [turn]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader
        title={t.page_label(page)}
        right={
          <View style={styles.pager}>
            {/* In RTL these flank the page number; back = previous, forward = next. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous page"
              hitSlop={8}
              disabled={page <= 1}
              onPress={() => turn(-1)}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={page <= 1 ? theme.colors.textMuted : theme.colors.primary}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next page"
              hitSlop={8}
              disabled={page >= TOTAL_PAGES}
              onPress={() => turn(1)}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={page >= TOTAL_PAGES ? theme.colors.textMuted : theme.colors.primary}
              />
            </Pressable>
          </View>
        }
      />

      <View
        ref={wrapRef}
        style={{ flex: 1, width: '100%', maxWidth, alignSelf: 'center' }}
        {...(Platform.OS === 'web' ? {} : pan.panHandlers)}
      >
        <MushafPageItem page={page} />
      </View>

      <AudioBar />
    </SafeAreaView>
  );
}

/** The current leaf — fetches its page and renders the fitted Mushaf page. */
function MushafPageItem({ page }: { page: number }) {
  const { translationEdition } = useReaderSettings();
  const { data: ayahs, isLoading } = usePageAyahs(page, translationEdition);
  const { data: surahs } = useSurahs();
  const currentAyahKey = usePlayback((s) => s.currentAyahKey);

  const playFrom = useCallback(
    (index: number) => {
      if (!ayahs) return;
      void playQueue(ayahs.slice(index).map((r) => ({ key: r.key, surah: r.surah, ayah: r.ayah })));
    },
    [ayahs],
  );

  if (isLoading || !ayahs) {
    return (
      <View style={styles.loading}>
        <AyahSkeleton />
        <AyahSkeleton />
      </View>
    );
  }

  const juz = ayahs[0]?.juz ?? 1;
  const firstSurah = ayahs[0]?.surah;
  const surahName = surahs?.find((s) => s.number === firstSurah)?.nameArabic ?? '';

  return (
    <MushafLeaf
      ayahs={ayahs}
      surahName={surahName}
      juz={juz}
      page={page}
      currentAyahKey={currentAyahKey}
      onTapAyah={playFrom}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pager: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  loading: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
});
