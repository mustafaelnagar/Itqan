import { SafeAreaView, ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { spacing } from '../tokens/spacing';
import { useContentMaxWidth } from '../layout';
import { useTheme } from './ThemeProvider';

export interface ScreenProps extends ViewProps {
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Disable default horizontal padding. */
  edgeToEdge?: boolean;
  /** Narrower max width for reading-heavy screens. */
  reading?: boolean;
}

/**
 * Consistent screen wrapper: safe area, themed background, responsive padding, and
 * content centered with a max width on tablet/desktop so it never stretches
 * edge-to-edge on a laptop or iPad.
 */
export function Screen({
  scroll = false,
  edgeToEdge = false,
  reading = false,
  style,
  children,
  ...rest
}: ScreenProps) {
  const theme = useTheme();
  const maxWidth = useContentMaxWidth(reading ? 'reading' : 'default');
  const padding = edgeToEdge ? {} : { paddingHorizontal: spacing.xl };
  const inner = { width: '100%' as const, maxWidth, alignSelf: 'center' as const };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollOuter}>
          <View style={[styles.scrollInner, inner, padding, style]} {...rest}>
            {children}
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.body, inner, padding, style]} {...rest}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { flex: 1, paddingVertical: spacing.lg },
  scrollOuter: { alignItems: 'center', paddingVertical: spacing.lg },
  scrollInner: { gap: spacing.lg },
});
