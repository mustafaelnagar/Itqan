import { StyleSheet, Text as RNText, View } from 'react-native';
import { Text, fontFamily, fontSize, spacing, useTheme } from '@itqan/design-system';
import { OrnateFrame, Ornament } from './Ornament';
import type { SurahRow } from '../db/repositories/quranRepo';
import { useT } from '../i18n';

const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

/**
 * Illuminated surah heading, styled like the gilded title cartouche of a printed
 * Mushaf: a framed surah name with corner rosettes, a quiet meta line, a gold
 * ornament, then the basmala — so each surah opens with dignity.
 */
export function SurahHeader({ surah }: { surah: SurahRow }) {
  const theme = useTheme();
  const t = useT();
  return (
    <View style={styles.wrap}>
      <OrnateFrame style={styles.cartouche}>
        <RNText style={[styles.arabicName, { color: theme.colors.primary }]}>
          {surah.nameArabic}
        </RNText>
        <Text variant="label" color={theme.colors.accent} style={styles.meta}>
          {surah.revelationType === 'meccan' ? t.common_meccan : t.common_medinan} ·{' '}
          {t.ayat_count(surah.ayahCount)}
        </Text>
      </OrnateFrame>

      {surah.bismillahPre ? (
        <>
          <Ornament style={styles.rule} />
          <RNText style={[styles.basmala, { color: theme.colors.text }]}>{BISMILLAH}</RNText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  cartouche: { alignItems: 'center', alignSelf: 'stretch', gap: spacing.xs, paddingVertical: spacing.md },
  arabicName: {
    fontFamily: fontFamily.quran,
    fontSize: 26,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  meta: { textAlign: 'center' },
  rule: { alignSelf: 'stretch', paddingHorizontal: spacing.xl },
  basmala: {
    fontFamily: fontFamily.quran,
    fontSize: fontSize.quranSm,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
