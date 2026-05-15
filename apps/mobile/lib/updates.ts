import * as ExpoUpdates from 'expo-updates'

export interface UpdateStatus {
  isUpdateAvailable: boolean
  isUpdatePending: boolean
  isChecking: boolean
}

export async function checkForUpdate(): Promise<boolean> {
  if (__DEV__ || !ExpoUpdates.isEnabled) return false

  try {
    const result = await ExpoUpdates.checkForUpdateAsync()
    return result.isAvailable
  } catch {
    return false
  }
}

export async function fetchAndApplyUpdate(): Promise<void> {
  await ExpoUpdates.fetchUpdateAsync()
  await ExpoUpdates.reloadAsync()
}
