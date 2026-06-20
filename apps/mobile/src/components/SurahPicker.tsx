import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Sheet, Text, spacing, useTheme } from '@itqan/design-system';
import { useSurahs } from '../features/quran/hooks';
import type { SurahRow } from '../db/repositories/quranRepo';
import { useLocale } from '../i18n';

/** Bottom sheet to pick a surah (used by Hifz select + plan screens). */
export function SurahPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (surah: SurahRow) => void;
}) {
  const theme = useTheme();
  const { t, isRTL } = useLocale();
  const { data: surahs } = useSurahs();
  return (
    <Sheet visible={visible} onClose={onClose} title={t.picker_choose_surah}>
      <FlatList
        data={surahs ?? []}
        keyExtractor={(s) => String(s.number)}
        style={{ maxHeight: 380 }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: theme.colors.border }]}
            onPress={() => {
              onSelect(item);
              onClose();
            }}
          >
            <Text variant="body">
              {item.number}. {isRTL ? item.nameArabic : item.nameSimple}
            </Text>
            <Text variant="caption" muted>
              {item.ayahCount}
            </Text>
          </Pressable>
        )}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
