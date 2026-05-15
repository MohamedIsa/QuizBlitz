import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { apiClient } from '@/core/api-client'

// Module-level cache so logout (which happens far away from useNotifications)
// can read the last-known token without coupling the store and the hook.
let lastRegisteredToken: string | null = null

export const PUSH_TOKEN_ENDPOINT = '/users/me/push-token'

// Remote push notifications are unavailable in Expo Go since SDK 53.
// `appOwnership === 'expo'` identifies Expo Go specifically (dev-client builds
// report `null`/`'standalone'` and DO support push). All functions in this
// module are safe to call — they no-op when push is unavailable.
export const PUSH_AVAILABLE = Constants.appOwnership !== 'expo'

export async function setupAndroidChannel() {
  if (!PUSH_AVAILABLE || Platform.OS !== 'android') return

  try {
    const Notifications = await import('expo-notifications')
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    })
  } catch {
    // Expo Go or unavailable
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!PUSH_AVAILABLE || !Device.isDevice) return false

  try {
    const Notifications = await import('expo-notifications')

    // expo-modules-core is nested inside expo — cast to access inherited `granted` field
    type PermStatus = { granted: boolean }
    const { granted } = (await Notifications.getPermissionsAsync()) as unknown as PermStatus
    if (granted) return true

    const { granted: grantedAfterRequest } =
      (await Notifications.requestPermissionsAsync()) as unknown as PermStatus
    return grantedAfterRequest
  } catch {
    return false
  }
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!PUSH_AVAILABLE) return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  if (!projectId) {
    if (__DEV__)
      console.warn('[notifications] No EAS projectId — set extra.eas.projectId in app.json')
    return null
  }

  try {
    const Notifications = await import('expo-notifications')
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
    return data
  } catch (err) {
    console.error('[notifications] Failed to get push token:', err)
    return null
  }
}

export async function registerPushTokenWithServer(token: string): Promise<void> {
  if (token === lastRegisteredToken) return
  try {
    await apiClient.post(PUSH_TOKEN_ENDPOINT, { token })
    lastRegisteredToken = token
  } catch (err) {
    console.warn('[notifications] Failed to register push token:', err)
  }
}

export async function deregisterPushTokenWithServer(): Promise<void> {
  if (!lastRegisteredToken) return
  try {
    await apiClient.delete(PUSH_TOKEN_ENDPOINT)
  } catch (err) {
    console.warn('[notifications] Failed to deregister push token:', err)
  } finally {
    lastRegisteredToken = null
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds = 1,
): Promise<void> {
  if (!PUSH_AVAILABLE) return

  try {
    const Notifications = await import('expo-notifications')
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    })
  } catch {
    // ignore
  }
}
