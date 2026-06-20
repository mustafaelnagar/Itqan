import { StyleSheet, View, type ViewProps } from 'react-native';
import { elevation, radius, spacing, type SpacingKey } from '../tokens/spacing';
import { useTheme } from './ThemeProvider';

export interface CardProps extends ViewProps {
  /** Inner padding token. */
  padding?: SpacingKey;
  /** Drop shadow level. */
  raised?: boolean;
}

export function Card({ padding = 'lg', raised = true, style, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          padding: spacing[padding],
        },
        raised ? elevation.sm : elevation.none,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
