import { Stack } from 'expo-router'
import { useAuthStore } from '@/store/auth'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  // Route-guard policy lives in `app/index.tsx` — see `app/_layout.tsx` comment.
  // This is a dev-only assertion to surface broken state transitions.
  if (__DEV__ && !isLoading && isAuthenticated) {
    console.warn('Authenticated user rendered (auth) layout — guard logic broke somewhere')
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  )
}
