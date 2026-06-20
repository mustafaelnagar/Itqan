import { FlatList, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, Text, fontFamily, radius, spacing, useTheme } from '@itqan/design-system';
import { useSurahs } from '@/features/quran/hooks';
import type { SurahRow } from '@/db/repositories/quranRepo';
import { useLastPosition } from '@/stores/lastPosition';
import { AyahSkeleton } from '@/components/Skeleton';
import { useLocale } from '@/i18n';
import { toArabicNumerals } from '@/lib/format';

export default function MushafIndexScreen() {
  const theme = useTheme();
  const { t } = useLocale();
  const { data: surahs, isLoading } = useSurahs();
  const position = useLastPosition((s) => s.position);

  return (
    <Screen edgeToEdge>
      <View style={styles.header}>
        <Text variant="title">{t.mode_mushaf_title}</Text>
        <View style={styles.headerActions}>
          <IconButton icon="search" onPress={() => router.push('/search')} />
          <IconButton icon="bookmark-outline" onPress={() => router.push('/bookmarks')} />
        </View>
      </View>

      {position ? (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/surah/[number]', params: { number: position.surah } })
          }
          style={styles.continueWrap}
        >
          <Card padding="md">
            <Text variant="label" muted>
              {t.home_continue_reading}
            </Text>
            <Text variant="bodyStrong" style={{ marginTop: spacing.xs }}>
              {position.surahName} · {t.home_ayah(position.ayah)}
            </Text>
          </Card>
        </Pressable>
      ) : null}

      {isLoading ? (
        <View style={{ paddingHorizontal: spacing.xl }}>
          <AyahSkeleton />
          <AyahSkeleton />
        </View>
      ) : (
        <FlatList
          data={surahs ?? []}
          keyExtractor={(s) => String(s.number)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <SurahRowItem surah={item} />}
          ItemSeparatorComponent={() => (
            <View
              style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }}
            />
          )}
        />
      )}
    </Screen>
  );
}

function SurahRowItem({ surah }: { surah: SurahRow }) {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const num = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/surah/[number]', params: { number: surah.number } })}
    >
      <View style={[styles.numberBadge, { borderColor: theme.colors.border }]}>
        <Text variant="caption" color={theme.colors.primary}>
          {num(surah.number)}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{surah.nameSimple}</Text>
        <Text variant="caption" muted>
          {t.ayat_count(surah.ayahCount)} ·{' '}
          {surah.revelationType === 'meccan' ? t.common_meccan : t.common_medinan}
        </Text>
      </View>
      <RNText style={[styles.arabicName, { color: theme.colors.text }]}>{surah.nameArabic}</RNText>
    </Pressable>
  );
}

function IconButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} style={styles.iconBtn}>
      <Ionicons name={icon} size={22} color={theme.colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  iconBtn: { padding: spacing.xs },
  continueWrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicName: { fontFamily: fontFamily.quran, fontSize: 20, writingDirection: 'rtl' },
});
