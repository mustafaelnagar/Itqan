import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, radius, spacing, useTheme } from '@itqan/design-system';

/** Compact +/- numeric stepper. */
export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const theme = useTheme();
  // Clamp defensively so the control can never display or emit an out-of-range
  // value (e.g. an ayah number beyond the surah's ayah count).
  const v = Math.min(Math.max(value, min), max);
  return (
    <View style={styles.row}>
      <Text variant="body">{label}</Text>
      <View style={styles.controls}>
        <Btn icon="remove" disabled={v <= min} onPress={() => onChange(Math.max(min, v - 1))} />
        <Text variant="bodyStrong" style={styles.value}>
          {v}
        </Text>
        <Btn icon="add" disabled={v >= max} onPress={() => onChange(Math.min(max, v + 1))} />
      </View>
    </View>
  );

  function Btn({
    icon,
    onPress,
    disabled,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    disabled?: boolean;
  }) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={6}
        style={[styles.btn, { borderColor: theme.colors.border, opacity: disabled ? 0.35 : 1 }]}
      >
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  value: { minWidth: 32, textAlign: 'center' },
  btn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
