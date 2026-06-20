import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@itqan/design-system';
import { useT } from '@/i18n';
import { useLanguageSettings } from '@/stores/languageSettings';

/**
 * Bottom-tab navigation (FND-004).
 * Home + the three core modes (Mushaf, Hifz Studio, Tasmiʿ) + Profile.
 */
export default function TabsLayout() {
  const theme = useTheme();
  const t = useT();
  const onboarded = useLanguageSettings((s) => s.onboarded);
  const hydrated = useLanguageSettings((s) => s.hydrated);

  // Wait for persisted state to load, then send first-time users to pick a
  // language before they reach the app. Rendering nothing pre-hydration avoids
  // a flash of the tabs for returning users.
  if (!hydrated) return null;
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        // The persistent global BottomNav (rendered in the root layout) is the
        // single source of navigation, so the built-in tab bar is hidden here to
        // avoid a duplicate.
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tab_home,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="mushaf"
        options={{
          title: t.tab_mushaf,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="hifz"
        options={{
          title: t.tab_hifz,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasmi"
        options={{
          title: t.tab_tasmi,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tab_profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
