import { View } from 'react-native';
import { radius, spacing, useTheme } from '@itqan/design-system';

/** Simple placeholder block for loading states (MUS-010). */
export function SkeletonLine({
  width = '100%',
  height = 16,
}: {
  width?: number | string;
  height?: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: width as number,
        height,
        borderRadius: radius.sm,
        backgroundColor: theme.colors.border,
        opacity: 0.6,
      }}
    />
  );
}

/** A stack of skeleton lines approximating an ayah card. */
export function AyahSkeleton() {
  return (
    <View style={{ gap: spacing.sm, paddingVertical: spacing.lg }}>
      <SkeletonLine width="90%" height={22} />
      <SkeletonLine width="70%" height={22} />
      <SkeletonLine width="55%" height={14} />
    </View>
  );
}
