// ─── Auth route-guard policy ─────────────────────────────────────────────
// Canonical guard: `app/index.tsx` (cold start) + the navigation actions in
// `useAuthStore` (`logout()` → `/(auth)/login`, `login()` → caller navigates).
// The `(auth)` and `(tabs)` layouts MUST NOT contain Redirect logic — they
// only render dev-mode assertions to catch broken state transitions. Adding
// guards to multiple layouts caused redirect-race flicker; keep it in one place.
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { darkTheme, lightTheme, THEME_CONFIG } from '@/theme';
import { SnackbarProvider, OfflineBanner, UpdateBanner } from '@/components/ui';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppStore } from '@/store/app';

SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const scheme = useColorScheme();
  const { themeMode } = useAppStore();
  const effectiveScheme = THEME_CONFIG.userSwitchable
    ? themeMode === 'system'
      ? scheme
      : themeMode
    : THEME_CONFIG.fixed;
  const theme = effectiveScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <SnackbarProvider>
          <UpdateBanner />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }} />
        </SnackbarProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemedApp />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
