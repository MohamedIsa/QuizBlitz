import { Stack } from 'expo-router'
import { useAuthStore } from '@/store/auth'

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (__DEV__ && !isLoading && isAuthenticated) {
    console.warn('Authenticated user rendered (auth) layout — guard logic broke somewhere')
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="landing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="success" options={{ gestureEnabled: false }} />
    </Stack>
  )
}
