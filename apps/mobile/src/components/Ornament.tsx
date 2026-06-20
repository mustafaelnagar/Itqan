import { StyleSheet, Text as RNText, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily, gradients, radius, spacing, useTheme } from '@itqan/design-system';

/**
 * Ornamental Islamic flourishes (no SVG dependency — glyphs + gilded gradients).
 *
 *  - <Ornament/>      a centered gold divider with a star/rosette glyph
 *  - <OrnateFrame/>   a gold-hairline panel with arabesque corner flourishes
 *  - <Bismillah/>     the basmala set in the Mushaf face under an ornament
 */

const CORNER = '❁'; // arabesque corner rosette
const STAR = '۞'; // Arabic rub-el-hizb — the classic Qurʾān section ornament

/** A gilded divider: gradient rule — glyph — gradient rule. */
export function Ornament({ glyph = STAR, style }: { glyph?: string; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View style={[styles.divider, style]}>
      <LinearGradient
        colors={['transparent', theme.colors.accent]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
      />
      <RNText style={[styles.glyph, { color: theme.colors.accent }]}>{glyph}</RNText>
      <LinearGradient
        colors={[theme.colors.accent, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.rule}
      />
    </View>
  );
}

/** A richly framed panel: gold hairline border + a rosette in each corner. */
export function OrnateFrame({
  children,
  style,
  tone,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Border/flourish color (defaults to the gold accent). */
  tone?: string;
}) {
  const theme = useTheme();
  const gold = tone ?? theme.colors.accent;
  return (
    <View
      style={[
        styles.frame,
        { borderColor: gold, backgroundColor: theme.colors.surfaceElevated },
        style,
      ]}
    >
      <RNText style={[styles.corner, styles.tl, { color: gold }]}>{CORNER}</RNText>
      <RNText style={[styles.corner, styles.tr, { color: gold }]}>{CORNER}</RNText>
      <RNText style={[styles.corner, styles.bl, { color: gold }]}>{CORNER}</RNText>
      <RNText style={[styles.corner, styles.br, { color: gold }]}>{CORNER}</RNText>
      {children}
    </View>
  );
}

/**
 * A printed-muṣḥaf page frame: warm parchment, a double gold rule (thick outer +
 * hairline inner), and a rosette in each inner corner. Wrap a page's verses in it.
 */
export function MushafFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const gold = theme.colors.accent;
  return (
    <View style={[styles.mushafOuter, { borderColor: gold }, style]}>
      <View
        style={[styles.mushafInner, { borderColor: gold, backgroundColor: theme.colors.mushafPaper }]}
      >
        <RNText style={[styles.corner, styles.mtl, { color: gold }]}>{CORNER}</RNText>
        <RNText style={[styles.corner, styles.mtr, { color: gold }]}>{CORNER}</RNText>
        <RNText style={[styles.corner, styles.mbl, { color: gold }]}>{CORNER}</RNText>
        <RNText style={[styles.corner, styles.mbr, { color: gold }]}>{CORNER}</RNText>
        {children}
      </View>
    </View>
  );
}

/** A gilded ayah-end medallion glyph for inline use in flowing text. */
export const AYAH_END = (n: string) => ` ۝${n} `;

/** The basmala under a gilded ornament — a dignified screen opener. */
export function Bismillah({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View style={[styles.bismillah, style]}>
      <Ornament />
      <RNText style={[styles.basmala, { color: theme.colors.primary }]}>
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </RNText>
    </View>
  );
}

// Re-export the gradient catalogue so callers can build gilded surfaces too.
export { gradients };

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  rule: { flex: 1, height: 1.5, borderRadius: 1 },
  glyph: { fontSize: 18, lineHeight: 20 },
  frame: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  corner: { position: 'absolute', fontSize: 14, lineHeight: 16 },
  tl: { top: 4, left: 6 },
  tr: { top: 4, right: 6 },
  bl: { bottom: 4, left: 6 },
  br: { bottom: 4, right: 6 },
  mushafOuter: { borderWidth: 2, borderRadius: radius.lg, padding: 3 },
  mushafInner: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md, padding: spacing.lg },
  mtl: { top: 3, left: 5 },
  mtr: { top: 3, right: 5 },
  mbl: { bottom: 3, left: 5 },
  mbr: { bottom: 3, right: 5 },
  bismillah: { alignItems: 'center', gap: spacing.sm },
  basmala: { fontFamily: fontFamily.quran, fontSize: 24, writingDirection: 'rtl', textAlign: 'center' },
});
