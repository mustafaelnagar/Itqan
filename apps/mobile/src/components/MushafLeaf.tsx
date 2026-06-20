import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { Text, fontFamily, lineHeight, radius, spacing, useTheme } from '@itqan/design-system';
import type { AyahRow } from '../db/repositories/quranRepo';
import { AYAH_END, Ornament } from './Ornament';
import { useReaderSettings } from '../stores/readerSettings';
import { toArabicNumerals } from '../lib/format';
import { useT } from '../i18n';

/** Reference Quran size the page is measured at before fitting to the screen. */
const REF_SIZE = 32;

/**
 * A single Mushaf leaf rendered like a printed page: a header band naming the
 * surah and juzʾ, the page's ayat flowing as one justified RTL block, and the
 * page number footer. At the default font size the whole page is auto-fitted to
 * the screen "in one shot" (no scroll); enlarging the font lets it scroll so the
 * reader can zoom in. Tapping an ayah plays from there; the sounding ayah glows.
 */
export function MushafLeaf({
  ayahs,
  surahName,
  juz,
  page,
  currentAyahKey,
  onTapAyah,
}: {
  ayahs: AyahRow[];
  surahName: string;
  juz: number;
  page: number;
  currentAyahKey: string | null;
  onTapAyah: (index: number) => void;
}) {
  const theme = useTheme();
  const t = useT();
  const { fontScale } = useReaderSettings();

  // Available text area and the page's natural height at the reference size.
  const [bodyH, setBodyH] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  // Default font → fit the page to the screen. Enlarged font → keep the chosen
  // size and allow scrolling (the user is zooming in).
  const enlarged = fontScale > 1;
  const fitFactor =
    !enlarged && bodyH > 0 && naturalH > 0 ? Math.min(1.3, Math.max(0.55, bodyH / naturalH)) : 1;
  const size = REF_SIZE * fitFactor * fontScale;
  const lh = size * lineHeight.quran;

  const plain = ayahs.map((a) => `${a.text}${AYAH_END(toArabicNumerals(a.ayah))}`).join('');

  const body = (
    <RNText
      style={[styles.text, { color: theme.colors.text, fontSize: size, lineHeight: lh }]}
      selectable={false}
    >
      {ayahs.map((ayah, index) => (
        <Fragment key={ayah.key}>
          <RNText
            onPress={() => onTapAyah(index)}
            style={
              ayah.key === currentAyahKey
                ? { color: theme.colors.highlight, backgroundColor: theme.colors.highlightSoft }
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
  );

  return (
    <View
      style={[
        styles.leaf,
        { backgroundColor: theme.colors.mushafPaper, borderColor: theme.colors.accent },
      ]}
    >
      {/* Header band — surah & juzʾ (so you always know where you are). */}
      <View style={[styles.band, { borderBottomColor: theme.colors.accent }]}>
        <Text variant="label" color={theme.colors.accent} numberOfLines={1}>
          {t.juz_label(juz)}
        </Text>
        <RNText style={[styles.bandSurah, { color: theme.colors.primary }]} numberOfLines={1}>
          {surahName}
        </RNText>
      </View>

      {/* Body — fitted to the leaf, or scrollable when enlarged. */}
      <View style={styles.bodyWrap} onLayout={(e) => setBodyH(e.nativeEvent.layout.height)}>
        {enlarged ? (
          <ScrollView contentContainerStyle={styles.scrollBody}>{body}</ScrollView>
        ) : (
          <View style={styles.fitBody}>{body}</View>
        )}

        {/* Hidden measurer — same width, fixed reference size, so the fit factor
            is stable and never oscillates. */}
        <RNText
          aria-hidden
          onLayout={(e) => setNaturalH(e.nativeEvent.layout.height)}
          style={[
            styles.text,
            styles.measurer,
            { fontSize: REF_SIZE, lineHeight: REF_SIZE * lineHeight.quran },
          ]}
        >
          {plain}
        </RNText>
      </View>

      {/* Footer — gold ornament + page number, like a printed muṣḥaf. */}
      <Ornament style={styles.rule} />
      <View style={styles.footer}>
        <Text variant="label" color={theme.colors.accent}>
          {t.page_label(page)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leaf: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bandSurah: { fontFamily: fontFamily.quran, fontSize: 20, writingDirection: 'rtl' },
  bodyWrap: { flex: 1, justifyContent: 'center' },
  fitBody: { paddingVertical: spacing.md },
  scrollBody: { paddingVertical: spacing.md },
  text: {
    fontFamily: fontFamily.quran,
    writingDirection: 'rtl',
    textAlign: 'justify',
  },
  measurer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0,
  },
  rule: { marginTop: spacing.sm },
  footer: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
});
