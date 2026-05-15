import { useEffect, useRef, useState } from 'react'
import { PUSH_AVAILABLE, setupAndroidChannel, requestNotificationPermission, getExpoPushToken } from '@/lib/notifications'

type Subscription = { remove(): void }

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const notifRef = useRef<Subscription | null>(null)
  const responseRef = useRef<Subscription | null>(null)

  useEffect(() => {
    if (!PUSH_AVAILABLE) return

    let cancelled = false

    async function setup() {
      await setupAndroidChannel()
      const granted = await requestNotificationPermission()
      if (cancelled) return
      setPermissionGranted(granted)

      if (granted) {
        const token = await getExpoPushToken()
        if (!cancelled) setExpoPushToken(token)
      }

      try {
        const Notifications = await import('expo-notifications')
        notifRef.current = Notifications.addNotificationReceivedListener(() => {})
        responseRef.current = Notifications.addNotificationResponseReceivedListener(() => {})
      } catch {
        // Expo Go — listeners unavailable
      }
    }

    void setup()

    return () => {
      cancelled = true
      notifRef.current?.remove()
      responseRef.current?.remove()
    }
  }, [])

  return { expoPushToken, permissionGranted }
}
