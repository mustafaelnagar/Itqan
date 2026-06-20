import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sheet, Text, radius, spacing, useTheme } from '@itqan/design-system';
import { RECITERS, isSurahReciter } from '../audio/reciters';
import { useReaderSettings } from '../stores/readerSettings';
import { useT } from '../i18n';

/** Bottom sheet to choose the reciter (AUD-001). */
export function ReciterPicker({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const t = useT();
  const { preferredReciterId, setReciter } = useReaderSettings();

  return (
    <Sheet visible={visible} onClose={onClose} title={t.picker_choose_reciter}>
      <View style={{ gap: spacing.xs }}>
        {RECITERS.map((r) => {
          const selected = r.id === preferredReciterId;
          return (
            <Pressable
              key={r.id}
              style={styles.row}
              onPress={() => {
                setReciter(r.id);
                onClose();
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text variant="bodyStrong">{r.name}</Text>
                  {isSurahReciter(r) ? (
                    <View style={[styles.tag, { borderColor: theme.colors.accent }]}>
                      <Text variant="label" color={theme.colors.accent}>
                        {t.reciter_full_surah}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <RNText style={[styles.arabic, { color: theme.colors.textMuted }]}>
                  {r.nameArabic}
                </RNText>
              </View>
              {selected ? (
                <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  arabic: { fontSize: 16, writingDirection: 'rtl', marginTop: 2 },
});
