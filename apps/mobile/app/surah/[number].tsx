import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ViewToken } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, spacing, useContentMaxWidth, useTheme } from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SurahHeader } from '@/components/SurahHeader';
import { AyahCard } from '@/components/AyahCard';
import { MushafPager } from '@/components/MushafPager';
import { ReadingNav } from '@/components/ReadingNav';
import { AyahSkeleton } from '@/components/Skeleton';
import { AudioBar } from '@/components/AudioBar';
import { DownloadButton } from '@/components/DownloadButton';
import { ReciterPicker } from '@/components/ReciterPicker';
import { useSurah, useSurahAyahs } from '@/features/quran/hooks';
import type { AyahRow } from '@/db/repositories/quranRepo';
import { useReaderSettings } from '@/stores/readerSettings';
import { useLastPosition } from '@/stores/lastPosition';
import { usePlayback } from '@/stores/playback';
import { playQueue } from '@/audio/player';
import { useLocale, useT } from '@/i18n';

export default function SurahReaderScreen() {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const params = useLocalSearchParams<{ number: string }>();
  const number = Number(params.number);

  const { translationEdition, readingMode } = useReaderSettings();
  const { data: surah } = useSurah(number);
  const { data: ayahs, isLoading, isError, refetch } = useSurahAyahs(number, translationEdition);
  const currentAyahKey = usePlayback((s) => s.currentAyahKey);
  const setPosition = useLastPosition((s) => s.setPosition);
  const [reciterPickerOpen, setReciterPickerOpen] = useState(false);
  const maxWidth = useContentMaxWidth('reading');
  const centered = { width: '100%' as const, maxWidth, alignSelf: 'center' as const };

  // Ayah-jump (ReadingNav): a FlatList in ayah view; in Mushaf view we turn the
  // pager to the leaf holding the chosen ayah via `jumpTarget`.
  const listRef = useRef<FlatList<AyahRow>>(null);
  const [jumpTarget, setJumpTarget] = useState<number | null>(null);

  const surahName = (isRTL ? surah?.nameArabic : surah?.nameSimple) ?? '';

  const playFrom = useCallback(
    (index: number) => {
      if (!ayahs) return;
      void playQueue(ayahs.slice(index).map((r) => ({ key: r.key, surah: r.surah, ayah: r.ayah })));
    },
    [ayahs],
  );

  const jumpToAyah = useCallback(
    (ayah: number) => {
      if (!ayahs) return;
      const index = ayahs.findIndex((a) => a.ayah === ayah);
      if (index < 0) return;
      if (readingMode === 'mushaf') {
        setJumpTarget(ayah);
      } else {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
      }
    },
    [ayahs, readingMode],
  );

  // Track reading position (MUS-008) — used by both the ayah list and the pager.
  const rememberPosition = useCallback(
    (a: AyahRow) => {
      if (surah) {
        setPosition({ surah: a.surah, ayah: a.ayah, ayahKey: a.key, surahName: surah.nameSimple });
      }
    },
    [surah, setPosition],
  );

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable)?.item as AyahRow | undefined;
    if (first) rememberPositionRef.current(first);
  }).current;
  // Keep the stable onViewable callback pointed at the latest closure.
  const rememberPositionRef = useRef(rememberPosition);
  rememberPositionRef.current = rememberPosition;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader
        title={surahName || t.surah_fallback(number)}
        subtitle={
          surah
            ? `${surah.revelationType === 'meccan' ? t.common_meccan : t.common_medinan} · ${t.ayat_count(surah.ayahCount)}`
            : undefined
        }
        right={
          <ReaderToolbar
            surah={surah ?? undefined}
            onPlayAll={() => playFrom(0)}
            onOpenReciter={() => setReciterPickerOpen(true)}
          />
        }
      />

      {surah ? (
        <View style={centered}>
          <ReadingNav ayahCount={surah.ayahCount} onJumpToAyah={jumpToAyah} />
        </View>
      ) : null}

      {isError ? (
        <ReaderError onRetry={() => void refetch()} />
      ) : isLoading || !surah ? (
        <View style={styles.loading}>
          <AyahSkeleton />
          <AyahSkeleton />
          <AyahSkeleton />
        </View>
      ) : readingMode === 'mushaf' ? (
        <View style={[centered, styles.fill]}>
          <MushafPager
            ayahs={ayahs ?? []}
            surahName={surahName || t.surah_fallback(number)}
            currentAyahKey={currentAyahKey}
            isRTL={isRTL}
            onTapAyah={playFrom}
            onVisiblePage={rememberPosition}
            jumpAyah={jumpTarget}
          />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          style={centered}
          data={ayahs ?? []}
          keyExtractor={(a) => a.key}
          ListHeaderComponent={<SurahHeader surah={surah} />}
          contentContainerStyle={styles.list}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          onScrollToIndexFailed={(info) => {
            // RNW/native: the target may be outside the render window. Scroll to
            // an estimate to force it to mount, then land precisely.
            listRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: false,
            });
            setTimeout(
              () =>
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0,
                }),
              140,
            );
          }}
          renderItem={({ item, index }) => (
            <AyahCard
              ayah={item}
              surahName={surahName}
              isCurrent={item.key === currentAyahKey}
              onPlay={() => playFrom(index)}
            />
          )}
        />
      )}

      <AudioBar />
      <ReciterPicker visible={reciterPickerOpen} onClose={() => setReciterPickerOpen(false)} />
    </SafeAreaView>
  );
}

function ReaderError({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.textMuted} />
      <Text variant="body" muted style={{ textAlign: 'center', marginVertical: spacing.md }}>
        {t.reader_error}
      </Text>
      <Pressable onPress={onRetry} hitSlop={8}>
        <Text variant="bodyStrong" color={theme.colors.primary}>
          {t.common_try_again}
        </Text>
      </Pressable>
    </View>
  );
}

function ReaderToolbar({
  surah,
  onPlayAll,
  onOpenReciter,
}: {
  surah?: { number: number; ayahCount: number };
  onPlayAll: () => void;
  onOpenReciter: () => void;
}) {
  const theme = useTheme();
  const {
    showTranslation,
    toggleTranslation,
    increaseFont,
    decreaseFont,
    readingMode,
    toggleReadingMode,
  } = useReaderSettings();
  const mushaf = readingMode === 'mushaf';
  return (
    <View style={styles.toolbar}>
      <Pressable hitSlop={6} onPress={decreaseFont} accessibilityLabel="Decrease font size">
        <Text variant="caption" color={theme.colors.primary}>
          A-
        </Text>
      </Pressable>
      <Pressable hitSlop={6} onPress={increaseFont} accessibilityLabel="Increase font size">
        <Text variant="bodyStrong" color={theme.colors.primary}>
          A+
        </Text>
      </Pressable>
      <Pressable
        hitSlop={6}
        onPress={toggleReadingMode}
        accessibilityRole="switch"
        accessibilityState={{ checked: mushaf }}
        accessibilityLabel={mushaf ? 'Switch to ayah view' : 'Switch to Mushaf page view'}
      >
        <Ionicons
          name={mushaf ? 'list-outline' : 'book-outline'}
          size={20}
          color={theme.colors.primary}
        />
      </Pressable>
      <Pressable
        hitSlop={6}
        onPress={toggleTranslation}
        accessibilityRole="switch"
        accessibilityState={{ checked: showTranslation }}
        accessibilityLabel="Toggle translation"
      >
        <Ionicons
          name="language"
          size={20}
          color={showTranslation ? theme.colors.primary : theme.colors.textMuted}
        />
      </Pressable>
      <Pressable hitSlop={6} onPress={onOpenReciter} accessibilityLabel="Choose reciter">
        <Ionicons name="headset-outline" size={22} color={theme.colors.primary} />
      </Pressable>
      {surah ? <DownloadButton surah={surah.number} ayahCount={surah.ayahCount} /> : null}
      <Pressable hitSlop={6} onPress={onPlayAll} accessibilityLabel="Play surah">
        <Ionicons name="play-circle" size={24} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  loading: { paddingHorizontal: spacing.xl },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] * 1.5 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
