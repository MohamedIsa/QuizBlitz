import { act, renderHook } from '@testing-library/react-native'
import { useAuthStore } from '@/store/auth'

import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

// Mock api-client token helpers
jest.mock('@/core/api-client', () => ({
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  refreshSession: jest.fn(),
  apiClient: {},
}))

// Mock notifications module — pulls in expo-constants/Device which fail under jsdom
jest.mock('@/lib/notifications', () => ({
  registerPushTokenWithServer: jest.fn(),
  deregisterPushTokenWithServer: jest.fn(),
  PUSH_AVAILABLE: false,
}))

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}))

const mockGet = SecureStore.getItemAsync as jest.Mock
const mockSet = SecureStore.setItemAsync as jest.Mock
const mockDelete = SecureStore.deleteItemAsync as jest.Mock

const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' }
const mockTokens = { accessToken: 'access', refreshToken: 'refresh' }

beforeEach(() => {
  jest.clearAllMocks()
  // Reset Zustand store between tests
  useAuthStore.setState({ isLoading: true, isAuthenticated: false, user: null })
})

describe('useAuthStore', () => {
  describe('_initialize', () => {
    it('sets authenticated when token exists', async () => {
      mockGet.mockResolvedValueOnce('access-token').mockResolvedValueOnce(JSON.stringify(mockUser))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current._initialize()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    it('sets unauthenticated when no token', async () => {
      mockGet.mockResolvedValue(null)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current._initialize()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('handles SecureStore errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('SecureStore unavailable'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current._initialize()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('stores tokens and sets authenticated state', async () => {
      mockSet.mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login(mockTokens, mockUser)
      })

      expect(mockSet).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser))
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  describe('logout', () => {
    it('clears state and redirects to login', async () => {
      mockDelete.mockResolvedValue(undefined)
      useAuthStore.setState({ isAuthenticated: true, user: mockUser, isLoading: false })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(router.replace).toHaveBeenCalledWith('/(auth)/login')
    })
  })

  describe('updateUser', () => {
    it('merges partial updates into user', () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true, isLoading: false })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.updateUser({ name: 'Updated Name' })
      })

      expect(result.current.user?.name).toBe('Updated Name')
      expect(result.current.user?.email).toBe(mockUser.email)
    })

    it('is a no-op when user is null', () => {
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.updateUser({ name: 'Ghost' })
      })

      expect(result.current.user).toBeNull()
    })
  })
})
