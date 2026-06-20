import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { AppProviders } from '@/providers/AppProviders';
import { BottomNav } from '@/components/BottomNav';
import { CookieConsent } from '@/components/CookieConsent';

/** Root layout — loads bundled fonts, then wraps the app in providers + a stack. */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Vendored, OFL-licensed, served from the app bundle — no external font calls.
    Inter: require('../assets/fonts/Inter.ttf'),
    AmiriQuran: require('../assets/fonts/AmiriQuran-Regular.ttf'),
  });

  // Hold render until fonts are ready (or failed) to avoid a flash of fallback text.
  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProviders>
      <StatusBar style="auto" />
      {/* The stack fills the space above a single, always-present nav bar, so
          navigation never disappears on a stacked sub-page. */}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="policy" />
          <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
        </Stack>
        <CookieConsent />
        <BottomNav />
      </View>
    </AppProviders>
  );
}
