import * as LocalAuthentication from 'expo-local-authentication'

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none'

export interface BiometricCapability {
  isAvailable: boolean
  biometricType: BiometricType
  isEnrolled: boolean
}

export async function getBiometricCapability(): Promise<BiometricCapability> {
  const isAvailable = await LocalAuthentication.hasHardwareAsync()
  if (!isAvailable) {
    return { isAvailable: false, biometricType: 'none', isEnrolled: false }
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync()
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

  let biometricType: BiometricType = 'none'
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    biometricType = 'facial'
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    biometricType = 'fingerprint'
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    biometricType = 'iris'
  }

  return { isAvailable, biometricType, isEnrolled }
}

export interface AuthenticateOptions {
  promptMessage?: string
  cancelLabel?: string
  fallbackLabel?: string
}

export interface AuthenticateResult {
  success: boolean
  cancelled: boolean
}

const CANCEL_ERRORS = new Set(['user_cancel', 'system_cancel', 'app_cancel'])

export async function authenticateWithBiometrics(
  options: AuthenticateOptions = {},
): Promise<AuthenticateResult> {
  const { promptMessage = 'Authenticate to continue', cancelLabel = 'Cancel' } = options

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel,
    disableDeviceFallback: false,
  })

  if (result.success) return { success: true, cancelled: false }
  return { success: false, cancelled: CANCEL_ERRORS.has(result.error) }
}
