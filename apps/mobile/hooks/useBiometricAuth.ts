import { useEffect } from 'react'
import { useBiometricStore } from '@/store/biometrics'
import { authenticateWithBiometrics } from '@/lib/biometrics'

export function useBiometricAuth() {
  const { isEnabled, capability, _loadCapability, enable, disable, toggle } = useBiometricStore()

  useEffect(() => {
    void _loadCapability()
  }, [_loadCapability])

  const authenticate = async (promptMessage?: string) => {
    if (!isEnabled || !capability?.isEnrolled) return { success: false, cancelled: false }
    return authenticateWithBiometrics({ promptMessage })
  }

  const canUseBiometrics = Boolean(capability?.isAvailable && capability?.isEnrolled)

  return {
    isEnabled,
    canUseBiometrics,
    capability,
    biometricType: capability?.biometricType ?? 'none',
    authenticate,
    enable,
    disable,
    toggle,
  }
}
