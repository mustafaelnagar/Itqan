import { FlatList, Pressable, StyleSheet, Text as RNText } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, fontFamily, fontSize, spacing, useTheme } from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useBookmarks } from '@/features/quran/hooks';
import type { BookmarkWithAyah } from '@/db/repositories/bookmarkRepo';
import { useT } from '@/i18n';

export default function BookmarksScreen() {
  const theme = useTheme();
  const t = useT();
  const { data: bookmarks, isLoading } = useBookmarks();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader title={t.bookmarks_title} />
      <FlatList
        data={bookmarks ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text variant="caption" muted style={styles.empty}>
            {isLoading ? t.common_loading : t.bookmarks_empty}
          </Text>
        }
        renderItem={({ item }) => <BookmarkRow bookmark={item} />}
      />
    </SafeAreaView>
  );
}

function BookmarkRow({ bookmark }: { bookmark: BookmarkWithAyah }) {
  const theme = useTheme();
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: theme.colors.border }]}
      onPress={() =>
        router.push({ pathname: '/surah/[number]', params: { number: bookmark.surah } })
      }
    >
      <Text variant="label" color={theme.colors.primary}>
        {bookmark.surahName} · {bookmark.surah}:{bookmark.ayah}
      </Text>
      <RNText style={[styles.arabic, { color: theme.colors.text }]} numberOfLines={2}>
        {bookmark.text}
      </RNText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  empty: { textAlign: 'center', paddingVertical: spacing['2xl'] },
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  arabic: {
    fontFamily: fontFamily.quran,
    fontSize: fontSize.quranSm,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
