import { Fragment, useMemo } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import {
  Text,
  fontFamily,
  fontSize,
  lineHeight,
  spacing,
  useTheme,
} from '@itqan/design-system';
import type { AyahRow } from '../db/repositories/quranRepo';
import { AYAH_END, MushafFrame, Ornament } from './Ornament';
import { useReaderSettings } from '../stores/readerSettings';
import { toArabicNumerals } from '../lib/format';
import { useT } from '../i18n';

/**
 * Continuous printed-Mushaf reading view (MUS-002): ayat flow as justified RTL
 * text, each closed by an ornate ayah-end marker ﴿n﴾, grouped by Mushaf page.
 * Tapping an ayah plays from there; the sounding ayah is highlighted.
 */
export function MushafPageView({
  ayahs,
  currentAyahKey,
  onTapAyah,
  onContainerLayout,
  onPageLayout,
}: {
  ayahs: AyahRow[];
  currentAyahKey: string | null;
  onTapAyah: (index: number) => void;
  /** Container's y within the scroll content — for ayah-jump math. */
  onContainerLayout?: (y: number) => void;
  /** Each page's y relative to the container — for ayah-jump math. */
  onPageLayout?: (page: number, y: number) => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { fontScale } = useReaderSettings();

  // Group ayat into Mushaf pages, preserving order.
  const pages = useMemo(() => {
    const map: { page: number; juz: number; items: { ayah: AyahRow; index: number }[] }[] = [];
    ayahs.forEach((ayah, index) => {
      const last = map[map.length - 1];
      if (last && last.page === ayah.page) last.items.push({ ayah, index });
      else map.push({ page: ayah.page, juz: ayah.juz, items: [{ ayah, index }] });
    });
    return map;
  }, [ayahs]);

  const arabicSize = fontSize.quranMd * fontScale;

  return (
    <View style={styles.container} onLayout={(e) => onContainerLayout?.(e.nativeEvent.layout.y)}>
      {pages.map(({ page, juz, items }) => (
        <View
          key={page}
          style={styles.page}
          onLayout={(e) => onPageLayout?.(page, e.nativeEvent.layout.y)}
        >
          <MushafFrame>
            <RNText
              style={[
                styles.body,
                {
                  color: theme.colors.text,
                  fontSize: arabicSize,
                  lineHeight: arabicSize * lineHeight.quran,
                },
              ]}
            >
              {items.map(({ ayah, index }) => (
                <Fragment key={ayah.key}>
                  <RNText
                    onPress={() => onTapAyah(index)}
                    style={
                      ayah.key === currentAyahKey
                        ? {
                            color: theme.colors.highlight,
                            backgroundColor: theme.colors.highlightSoft,
                          }
                        : undefined
                    }
                  >
                    {ayah.text}
                  </RNText>
                  <RNText style={{ color: theme.colors.accent }}>
                    {AYAH_END(toArabicNumerals(ayah.ayah))}
                  </RNText>
                </Fragment>
              ))}
            </RNText>

            <Ornament style={styles.rule} />
            <View style={styles.footer}>
              <Text variant="label" color={theme.colors.accent}>
                {t.page_label(page)} · {t.juz_label(juz)}
              </Text>
            </View>
          </MushafFrame>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] * 1.5 },
  page: { marginBottom: spacing.xl },
  body: {
    fontFamily: fontFamily.quran,
    writingDirection: 'rtl',
    textAlign: 'justify',
  },
  rule: { marginTop: spacing.lg, marginBottom: spacing.sm },
  footer: { alignItems: 'center' },
});
