import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, elevation, radius, spacing, useTheme } from '@itqan/design-system';
import { usePlayback } from '../stores/playback';
import { applySpeed, pause, resume, skipNext, skipPrevious, stop } from '../audio/player';
import { useSpacebarPlayPause } from '../hooks/useSpacebarPlayPause';

const SPEEDS = [0.75, 1, 1.25, 1.5];

/** Floating transport bar, visible whenever a playback session is active. */
export function AudioBar() {
  const theme = useTheme();
  const { status, currentAyahKey, speed, repeatMode, setRepeatMode, gapEnabled, toggleGap } =
    usePlayback();

  // Spacebar = play/pause on web/tablet (hook runs even while the bar is hidden).
  useSpacebarPlayPause();

  if (status === 'idle' || !currentAyahKey) return null;

  // 'gap' is the silent listen-and-repeat pause — treat as actively playing.
  const isPlaying = status === 'playing' || status === 'gap';
  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1;
    void applySpeed(next);
  };
  const cycleRepeat = () => {
    const order = ['off', 'one', 'range'] as const;
    setRepeatMode(order[(order.indexOf(repeatMode) + 1) % order.length]!);
  };

  return (
    <View
      style={[
        styles.bar,
        elevation.md,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
      ]}
    >
      <Ctrl icon="play-skip-back" color={theme.colors.text} onPress={() => void skipPrevious()} />
      <Ctrl
        icon={isPlaying ? 'pause-circle' : 'play-circle'}
        size={40}
        color={theme.colors.primary}
        onPress={() => void (isPlaying ? pause() : resume())}
      />
      <Ctrl icon="play-skip-forward" color={theme.colors.text} onPress={() => void skipNext()} />

      <Pressable onPress={cycleSpeed} hitSlop={8} style={styles.pill}>
        <Text variant="label" color={theme.colors.text}>
          {speed}×
        </Text>
      </Pressable>
      <Pressable onPress={cycleRepeat} hitSlop={8} style={styles.pill}>
        <Ionicons
          name={repeatMode === 'one' ? 'repeat-outline' : 'repeat'}
          size={18}
          color={repeatMode === 'off' ? theme.colors.textMuted : theme.colors.primary}
        />
        {repeatMode === 'one' ? (
          <Text variant="label" color={theme.colors.primary}>
            1
          </Text>
        ) : null}
      </Pressable>

      {/* AUD-011: pause after each ayah so the user can repeat. */}
      <Pressable
        onPress={toggleGap}
        hitSlop={8}
        style={styles.pill}
        accessibilityLabel="Repeat-after-me gap"
      >
        <Ionicons
          name="mic-outline"
          size={18}
          color={gapEnabled ? theme.colors.primary : theme.colors.textMuted}
        />
      </Pressable>

      <Ctrl icon="close" color={theme.colors.textMuted} onPress={() => void stop()} />
    </View>
  );
}

function Ctrl({
  icon,
  color,
  size = 28,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}>
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: spacing.xs },
});
