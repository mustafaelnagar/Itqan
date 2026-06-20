import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text as RNText, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, fontFamily, fontSize, radius, spacing, useTheme } from '@itqan/design-system';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSearch } from '@/features/quran/hooks';
import { useReaderSettings } from '@/stores/readerSettings';
import type { SearchResult } from '@/db/repositories/quranRepo';
import { useT } from '@/i18n';

export default function SearchScreen() {
  const theme = useTheme();
  const t = useT();
  const [query, setQuery] = useState('');
  const edition = useReaderSettings((s) => s.translationEdition);
  const { data: results, isFetching } = useSearch(query, edition);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenHeader title={t.search_title} />
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.search_placeholder}
          placeholderTextColor={theme.colors.textMuted}
          autoFocus
          style={[
            styles.input,
            {
              color: theme.colors.text,
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        />
      </View>

      <FlatList
        data={results ?? []}
        keyExtractor={(r) => r.key}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text variant="caption" muted style={styles.empty}>
            {query.trim().length < 2
              ? t.search_min_chars
              : isFetching
                ? t.search_searching
                : t.search_no_results}
          </Text>
        }
        renderItem={({ item }) => <ResultRow result={item} />}
      />
    </SafeAreaView>
  );
}

function ResultRow({ result }: { result: SearchResult }) {
  const theme = useTheme();
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: theme.colors.border }]}
      onPress={() => router.push({ pathname: '/surah/[number]', params: { number: result.surah } })}
    >
      <Text variant="label" color={theme.colors.primary}>
        {result.surahName} · {result.surah}:{result.ayah}
      </Text>
      <RNText style={[styles.arabic, { color: theme.colors.text }]} numberOfLines={2}>
        {result.text}
      </RNText>
      {result.translation ? (
        <Text variant="caption" muted numberOfLines={2}>
          {result.translation}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchWrap: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
  },
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
