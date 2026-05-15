/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react-native'
import { PaperProvider } from 'react-native-paper'

// ─── Imports (after mocks) ─────────────────────────────────────────────────

import LoginScreen from '@/app/(auth)/login'
import { useAuthStore } from '@/store/auth'

// ─── Mocks (all jest.mock calls are hoisted) ───────────────────────────────

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  router: { replace: jest.fn(), push: jest.fn() },
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light' },
}))

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([1]), // fingerprint
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
  AuthenticationType: { FACIAL_RECOGNITION: 2, FINGERPRINT: 1, IRIS: 3 },
}))

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/secureFetch', () => ({
  pinnedFetch: null,
  PUBLIC_KEY_HASHES: [],
}))

const mockApiPost = jest.fn()
jest.mock('@/core/api-client', () => {
  class APIClientError extends Error {
    status: number
    details: unknown
    constructor(message: string, status: number, details: unknown) {
      super(message)
      this.name = 'APIClientError'
      this.status = status
      this.details = details
    }
  }
  return {
    apiClient: {
      post: (...args: unknown[]) => mockApiPost(...args),
      get: jest.fn(),
      delete: jest.fn(),
    },
    APIClientError,
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    refreshSession: jest.fn(),
  }
})

jest.mock('@/lib/notifications', () => ({
  registerPushTokenWithServer: jest.fn(),
  deregisterPushTokenWithServer: jest.fn(),
  PUSH_AVAILABLE: false,
}))

const mockShow = jest.fn()
jest.mock('@/components/ui/Snackbar', () => {
  const actual = jest.requireActual('@/components/ui/Snackbar')
  return {
    ...actual,
    useSnackbar: () => ({ show: mockShow, hide: jest.fn() }),
  }
})

const mockBiometricAuthenticate = jest.fn().mockResolvedValue({ success: true, cancelled: false })
let mockIsEnabled = true
let mockCanUseBiometrics = true
let mockBiometricType: string = 'fingerprint'

jest.mock('@/hooks/useBiometricAuth', () => ({
  useBiometricAuth: () => ({
    isEnabled: mockIsEnabled,
    canUseBiometrics: mockCanUseBiometrics,
    biometricType: mockBiometricType,
    authenticate: mockBiometricAuthenticate,
    capability: { isAvailable: true, biometricType: mockBiometricType, isEnrolled: true },
    enable: jest.fn(),
    disable: jest.fn(),
    toggle: jest.fn(),
  }),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PaperProvider>{children}</PaperProvider>
}

beforeEach(() => {
  mockApiPost.mockReset()
  mockShow.mockReset()
  mockBiometricAuthenticate.mockReset()
  mockBiometricAuthenticate.mockResolvedValue({ success: true, cancelled: false })
  mockIsEnabled = true
  mockCanUseBiometrics = true
  mockBiometricType = 'fingerprint'

  // Reset auth store actions to jest.fn so we can spy
  useAuthStore.setState({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    login: jest.fn().mockResolvedValue(undefined),
    biometricLogin: jest.fn().mockResolvedValue(undefined),
  })
})

describe('LoginScreen — structure', () => {
  it('renders the title, email/password fields, sign-in button, and footer links', () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )

    expect(getByText('Welcome back')).toBeTruthy()
    expect(getByPlaceholderText('you@example.com')).toBeTruthy()
    expect(getByPlaceholderText('••••••••')).toBeTruthy()
    expect(getByText('Sign In')).toBeTruthy()
    expect(getByText('Forgot password?')).toBeTruthy()
    expect(getByText(/Create one/)).toBeTruthy()
  })

  it('renders [DEV] Skip login when __DEV__ is true', () => {
    // __DEV__ is true in jest by default
    const { getByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )
    expect(getByText('[DEV] Skip login')).toBeTruthy()
  })
})

describe('LoginScreen — biometric button visibility', () => {
  it('hides biometric button when canUseBiometrics is false', () => {
    mockCanUseBiometrics = false
    const { queryByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )
    expect(queryByText('Sign in with Fingerprint')).toBeNull()
    expect(queryByText('Sign in with Face ID')).toBeNull()
  })

  it('hides biometric button when isEnabled is false', () => {
    mockIsEnabled = false
    const { queryByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )
    expect(queryByText('Sign in with Fingerprint')).toBeNull()
  })

  it('shows fingerprint button when isEnabled && canUseBiometrics && type=fingerprint', () => {
    const { getByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )
    expect(getByText('Sign in with Fingerprint')).toBeTruthy()
  })

  it('shows Face ID button when biometricType=facial', () => {
    mockBiometricType = 'facial'
    const { getByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )
    expect(getByText('Sign in with Face ID')).toBeTruthy()
  })
})

describe('LoginScreen — biometric flow', () => {
  it('calls authenticate() and biometricLogin() on tap', async () => {
    const biometricLogin = jest.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ biometricLogin })

    const { getByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )

    await act(async () => {
      fireEvent.press(getByText('Sign in with Fingerprint'))
    })

    expect(mockBiometricAuthenticate).toHaveBeenCalledWith('Sign in to your account')
    expect(biometricLogin).toHaveBeenCalledTimes(1)
  })

  it('does NOT show error snackbar when user cancels biometric prompt', async () => {
    mockBiometricAuthenticate.mockResolvedValueOnce({ success: false, cancelled: true })
    const biometricLogin = jest.fn()
    useAuthStore.setState({ biometricLogin })

    const { getByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )

    await act(async () => {
      fireEvent.press(getByText('Sign in with Fingerprint'))
    })

    expect(biometricLogin).not.toHaveBeenCalled()
    expect(mockShow).not.toHaveBeenCalled()
  })

  it('shows error snackbar when biometric authenticate fails (non-cancellation)', async () => {
    mockBiometricAuthenticate.mockResolvedValueOnce({ success: false, cancelled: false })

    const { getByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )

    await act(async () => {
      fireEvent.press(getByText('Sign in with Fingerprint'))
    })

    expect(mockShow).toHaveBeenCalledWith('Biometric authentication failed', { type: 'error' })
  })

  it('shows error snackbar when biometricLogin throws an APIClientError', async () => {
    const { APIClientError } = require('@/core/api-client')
    const biometricLogin = jest
      .fn()
      .mockRejectedValue(new APIClientError('Session expired', 401, null))
    useAuthStore.setState({ biometricLogin })

    const { getByText } = render(
      <Wrapper>
        <LoginScreen />
      </Wrapper>,
    )

    await act(async () => {
      fireEvent.press(getByText('Sign in with Fingerprint'))
    })

    await waitFor(() => {
      expect(mockShow).toHaveBeenCalledWith('Session expired', { type: 'error' })
    })
  })
})
