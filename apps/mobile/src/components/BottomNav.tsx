import { Pressable, StyleSheet, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, spacing, useTheme } from '@itqan/design-system';
import { useT } from '@/i18n';
import { useLanguageSettings } from '@/stores/languageSettings';

interface NavItem {
  href: '/' | '/mushaf' | '/hifz' | '/tasmi' | '/profile';
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  matches: (path: string) => boolean;
}

/**
 * Persistent app navigation, rendered once at the root so it stays put on every
 * screen — including stacked sub-pages (a surah, a Tasmiʿ session) that would
 * otherwise strand the user with only a back button. Tapping a destination
 * jumps straight there from anywhere; the active tab is inferred from the route.
 */
export function BottomNav() {
  const theme = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const onboarded = useLanguageSettings((s) => s.onboarded);

  // No nav chrome until the user is through first-launch onboarding (or while
  // sitting on the onboarding route) — it's a standalone, chrome-free flow.
  if (!onboarded || pathname.startsWith('/onboarding')) return null;

  const items: NavItem[] = [
    {
      href: '/',
      icon: 'home-outline',
      activeIcon: 'home',
      label: t.tab_home,
      matches: (p) => p === '/',
    },
    {
      href: '/mushaf',
      icon: 'book-outline',
      activeIcon: 'book',
      label: t.tab_mushaf,
      // Reading-flow routes all live under the Mushaf destination.
      matches: (p) =>
        ['/mushaf', '/surah', '/page', '/search', '/bookmarks'].some((r) => p.startsWith(r)),
    },
    {
      href: '/hifz',
      icon: 'school-outline',
      activeIcon: 'school',
      label: t.tab_hifz,
      matches: (p) => p.startsWith('/hifz'),
    },
    {
      href: '/tasmi',
      icon: 'mic-outline',
      activeIcon: 'mic',
      label: t.tab_tasmi,
      matches: (p) => p.startsWith('/tasmi'),
    },
    {
      href: '/profile',
      icon: 'person-outline',
      activeIcon: 'person',
      label: t.tab_profile,
      matches: (p) => p.startsWith('/profile'),
    },
  ];

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, spacing.sm),
          backgroundColor: theme.colors.surfaceElevated,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {items.map((it) => {
        const active = it.matches(pathname);
        const color = active ? theme.colors.primary : theme.colors.textMuted;
        return (
          <Pressable
            key={it.href}
            style={styles.item}
            onPress={() => router.navigate(it.href)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={it.label}
          >
            <Ionicons name={active ? it.activeIcon : it.icon} size={22} color={color} />
            <Text variant="label" color={color}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.xs },
});
