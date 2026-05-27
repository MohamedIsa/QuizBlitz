import { useEffect } from 'react'
import { Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '@/store/auth'
import { useAppTheme } from '@/theme'
import { useNotifications } from '@/hooks/useNotifications'
import { registerPushTokenWithServer } from '@/lib/notifications'

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { colors } = useAppTheme()

  // Register for push notifications once the authenticated shell mounts
  const { expoPushToken } = useNotifications()

  // Sync the token to the server whenever it appears or rotates.
  // Failures are logged inside the helper — never crash the shell.
  useEffect(() => {
    if (expoPushToken) void registerPushTokenWithServer(expoPushToken)
  }, [expoPushToken])

  // Route-guard policy lives in `app/index.tsx` — see `app/_layout.tsx` comment.
  // This is a dev-only assertion to surface broken state transitions.
  if (__DEV__ && !isLoading && !isAuthenticated) {
    console.warn('Unauthenticated user reached (tabs) layout — guard logic broke somewhere')
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
