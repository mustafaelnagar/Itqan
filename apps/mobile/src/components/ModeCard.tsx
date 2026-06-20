import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text, elevation, fontFamily, radius, spacing } from '@itqan/design-system';

export interface ModeCardProps {
  title: string;
  subtitle: string;
  arabic?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string, ...string[]];
  onPress: () => void;
  /** Span the full row (e.g. a featured card). */
  full?: boolean;
  /** flex-basis for the tile (lets the grid switch column counts responsively). */
  basis?: number | `${number}%`;
  /** Grow to fill the parent cell's height (single-screen grid). */
  fill?: boolean;
}

/** A vibrant, tappable card for a primary app mode. */
export function ModeCard({
  title,
  subtitle,
  arabic,
  icon,
  gradient,
  onPress,
  full,
  basis,
  fill,
}: ModeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} — ${subtitle}`}
      style={({ pressed }) => [
        styles.wrap,
        full ? styles.full : styles.tile,
        !full && basis != null ? { flexBasis: basis } : null,
        fill ? styles.fill : null,
        elevation.md,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, fill ? styles.gradientFill : null]}
      >
        {/* Rub-el-hizb star — a quiet Islamic motif. */}
        <RNText style={styles.motif}>۞</RNText>

        {/* Faint Arabic name as a background flourish. Rendered first and kept
            very low-opacity so the (possibly Arabic) title reads cleanly on top
            instead of colliding with a near-identical second label. */}
        {arabic ? (
          <RNText style={styles.arabic} numberOfLines={1}>
            {arabic}
          </RNText>
        ) : null}

        <View style={styles.iconBadge}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>

        <View style={styles.text}>
          <Text variant="heading" color="#FFFFFF">
            {title}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.85)">
            {subtitle}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, overflow: 'hidden' },
  tile: { flexGrow: 1, flexBasis: '47%', minWidth: 150 },
  full: { width: '100%' },
  fill: { flex: 1 },
  gradient: {
    minHeight: 150,
    padding: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  gradientFill: { flex: 1, minHeight: 0 },
  motif: {
    position: 'absolute',
    top: -10,
    right: -6,
    fontSize: 86,
    color: 'rgba(255,255,255,0.12)',
    fontFamily: fontFamily.quran,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { marginTop: spacing.md, gap: 2, zIndex: 1 },
  arabic: {
    position: 'absolute',
    bottom: -spacing.md,
    right: spacing.md,
    fontSize: 52,
    lineHeight: 76,
    color: 'rgba(255,255,255,0.12)',
    fontFamily: fontFamily.quran,
    writingDirection: 'rtl',
  },
});
