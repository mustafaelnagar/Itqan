import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, spacing, useTheme } from '@itqan/design-system';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back chevron (defaults to true when navigation can go back). */
  showBack?: boolean;
  right?: React.ReactNode;
}

/** Themed top bar for stacked (non-tab) screens. */
export function ScreenHeader({ title, subtitle, showBack = true, right }: ScreenHeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={26} color={theme.colors.primary} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <View style={styles.titles}>
        <Text variant="heading" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" muted numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  back: { width: 32, alignItems: 'flex-start' },
  titles: { flex: 1 },
  right: { minWidth: 32, alignItems: 'flex-end' },
});
