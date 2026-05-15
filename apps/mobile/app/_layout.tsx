// ─── Auth route-guard policy ─────────────────────────────────────────────
// Canonical guard: `app/index.tsx` (cold start) + the navigation actions in
// `useAuthStore` (`logout()` → `/(auth)/login`, `login()` → caller navigates).
// The `(auth)` and `(tabs)` layouts MUST NOT contain Redirect logic — they
// only render dev-mode assertions to catch broken state transitions. Adding
// guards to multiple layouts caused redirect-race flicker; keep it in one place.
import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { darkTheme, lightTheme, THEME_CONFIG } from '@/theme'
import { SnackbarProvider, OfflineBanner, UpdateBanner } from '@/components/ui'
import { AuthProvider } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAppStore } from '@/store/app'

function ThemedApp() {
  const scheme = useColorScheme()
  const { themeMode } = useAppStore()
  const effectiveScheme = THEME_CONFIG.userSwitchable
    ? themeMode === 'system'
      ? scheme
      : themeMode
    : THEME_CONFIG.fixed
  const theme = effectiveScheme === 'dark' ? darkTheme : lightTheme

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
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemedApp />
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}
