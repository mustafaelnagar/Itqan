import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sheet, Text, radius, spacing, useTheme } from '@itqan/design-system';
import { useSurahs } from '../features/quran/hooks';
import { toArabicNumerals } from '../lib/format';
import { useLocale } from '../i18n';

/** Madani 604-page muṣḥaf — the first page of each of the 30 ajzāʾ. */
const JUZ_START_PAGE = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402,
  422, 442, 462, 482, 502, 522, 542, 562, 582,
];

type Mode = 'surah' | 'juz' | 'ayah' | null;

/**
 * Compact reading jump-bar (MUS): three pill controls — Surah, Juzʾ, Ayah —
 * that open a bottom-sheet picker so the reader can move anywhere in the muṣḥaf
 * without leaving the page. Surah/Juzʾ navigate; Ayah scrolls the current surah.
 */
export function ReadingNav({
  ayahCount,
  onJumpToAyah,
}: {
  ayahCount: number;
  onJumpToAyah: (ayah: number) => void;
}) {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const { data: surahs } = useSurahs();
  const [mode, setMode] = useState<Mode>(null);
  const close = () => setMode(null);

  const num = (n: number) => (isRTL ? toArabicNumerals(n) : String(n));

  const controls = [
    { key: 'surah', icon: 'book-outline', label: t.nav_surah },
    { key: 'juz', icon: 'layers-outline', label: t.nav_juz },
    { key: 'ayah', icon: 'list-outline', label: t.nav_ayah },
  ] as const;

  return (
    <>
      <View
        style={[
          styles.bar,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
        ]}
      >
        {controls.map((c) => (
          <Pressable
            key={c.key}
            style={styles.pill}
            onPress={() => setMode(c.key)}
            accessibilityRole="button"
            accessibilityLabel={c.label}
          >
            <Ionicons name={c.icon} size={16} color={theme.colors.primary} />
            <Text variant="caption" color={theme.colors.primary}>
              {c.label}
            </Text>
            <Ionicons name="chevron-down" size={13} color={theme.colors.textMuted} />
          </Pressable>
        ))}
      </View>

      {/* Surah picker → navigate */}
      <Sheet visible={mode === 'surah'} onClose={close} title={t.picker_choose_surah}>
        <FlatList
          data={surahs ?? []}
          keyExtractor={(s) => String(s.number)}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, { borderBottomColor: theme.colors.border }]}
              onPress={() => {
                close();
                router.replace({ pathname: '/surah/[number]', params: { number: item.number } });
              }}
            >
              <Text variant="body">
                {num(item.number)}. {item.nameSimple}
              </Text>
              <Text variant="body" color={theme.colors.primary} style={styles.arabicName}>
                {item.nameArabic}
              </Text>
            </Pressable>
          )}
        />
      </Sheet>

      {/* Juzʾ picker → navigate to its first page */}
      <Sheet visible={mode === 'juz'} onClose={close} title={t.picker_choose_juz}>
        <FlatList
          data={JUZ_START_PAGE}
          keyExtractor={(_, i) => String(i + 1)}
          numColumns={5}
          style={styles.list}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item, index }) => (
            <Pressable
              style={[styles.cell, { borderColor: theme.colors.border }]}
              onPress={() => {
                close();
                router.replace({ pathname: '/page/[number]', params: { number: item } });
              }}
            >
              <Text variant="bodyStrong" color={theme.colors.primary}>
                {num(index + 1)}
              </Text>
            </Pressable>
          )}
        />
      </Sheet>

      {/* Ayah picker → scroll within the current surah */}
      <Sheet visible={mode === 'ayah'} onClose={close} title={t.picker_choose_ayah}>
        <FlatList
          data={Array.from({ length: ayahCount }, (_, i) => i + 1)}
          keyExtractor={(n) => String(n)}
          numColumns={5}
          style={styles.list}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.cell, { borderColor: theme.colors.border }]}
              onPress={() => {
                close();
                onJumpToAyah(item);
              }}
            >
              <Text variant="bodyStrong" color={theme.colors.primary}>
                {num(item)}
              </Text>
            </Pressable>
          )}
        />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  list: { maxHeight: 420 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  arabicName: { writingDirection: 'rtl' },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
