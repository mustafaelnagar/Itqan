import { StyleSheet, View } from 'react-native';
import { radius, useTheme } from '@itqan/design-system';

/**
 * A compact, read-only "slide bar" that visualizes a selected [lo, hi] span over
 * the full [min, max] range — paired with the +/− steppers that drive it. Gives an
 * at-a-glance sense of how much of a surah (or passage) the chosen ayah range covers.
 */
export function RangeBar({
  min,
  max,
  lo,
  hi,
}: {
  min: number;
  max: number;
  lo: number;
  hi: number;
}) {
  const theme = useTheme();
  const span = Math.max(1, max - min);
  const clampedLo = Math.min(Math.max(lo, min), max);
  const clampedHi = Math.min(Math.max(hi, clampedLo), max);
  const left = ((clampedLo - min) / span) * 100;
  // +1 so a single-ayah selection still shows a visible sliver of fill.
  const width = Math.min(100 - left, ((clampedHi - clampedLo + 1) / (span + 1)) * 100);

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
      <View
        style={[
          styles.fill,
          { backgroundColor: theme.colors.primary, left: `${left}%`, width: `${width}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, bottom: 0, borderRadius: radius.full },
});
