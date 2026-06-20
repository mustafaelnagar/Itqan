import { Fragment } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { fontFamily, fontSize, lineHeight, useTheme } from '@itqan/design-system';
import { AYAH_END, MushafFrame } from './Ornament';
import type { LiveAyahView, LiveWordStatus } from '../features/tasmi/liveAligner';
import { toArabicNumerals } from '../lib/format';

/**
 * The Tasmiʿ "page" — the passage laid out like a printed Mushaf leaf (parchment,
 * gold frame, ayah-end medallions). Words start as faint ghosts (an empty page)
 * and fill in with solid ink as the reciter's voice matches the scripture. The
 * word currently expected glows; if the reciter stalls there past the grace
 * period it turns red. Skipped words are softly flagged amber.
 */
export function TasmiPageView({ ayat, alarm = false }: { ayat: LiveAyahView[]; alarm?: boolean }) {
  const theme = useTheme();

  const colorFor = (s: LiveWordStatus): string => {
    switch (s) {
      case 'correct':
        return theme.colors.text;
      case 'current':
        return alarm ? theme.colors.danger : theme.colors.primary;
      case 'missed':
        return theme.colors.warning;
      default:
        return theme.colors.textMuted; // pending — dimmed via opacity below
    }
  };

  return (
    <MushafFrame>
      <RNText style={[styles.body, { color: theme.colors.text }]}>
        {ayat.map((ayah) => {
          const ayahNum = Number(ayah.ayahKey.split(':')[1] ?? '0');
          return (
            <Fragment key={ayah.ayahKey}>
              {ayah.words.map((w, i) => (
                <RNText
                  key={`${ayah.ayahKey}-${i}`}
                  style={{
                    color: colorFor(w.status),
                    opacity: w.status === 'pending' ? 0.26 : 1,
                    textDecorationLine: w.status === 'missed' ? 'underline' : 'none',
                    fontWeight: w.status === 'current' ? '700' : '400',
                  }}
                >
                  {w.raw}{' '}
                </RNText>
              ))}
              <RNText style={{ color: theme.colors.accent }}>
                {AYAH_END(toArabicNumerals(ayahNum))}
              </RNText>
            </Fragment>
          );
        })}
      </RNText>
    </MushafFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fontFamily.quran,
    fontSize: fontSize.quranLg,
    lineHeight: fontSize.quranLg * lineHeight.quran,
    writingDirection: 'rtl',
    textAlign: 'justify',
  },
});
