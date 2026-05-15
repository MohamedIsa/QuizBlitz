import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'
import { clearTokens, refreshSession, setTokens } from '@/core/api-client'
import { deregisterPushTokenWithServer } from '@/lib/notifications'

export interface User {
  id: string
  email: string
  name?: string
}

interface LoginTokens {
  accessToken: string
  refreshToken: string
  sessionId?: string
}

interface AuthStore {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  _initialize: () => Promise<void>
  login: (tokens: LoginTokens, user: User) => Promise<void>
  biometricLogin: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const USER_KEY = 'auth_user'

export const useAuthStore = create<AuthStore>((set) => ({
  isLoading: true,
  isAuthenticated: false,
  user: null,

  _initialize: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync('access_token'),
        SecureStore.getItemAsync(USER_KEY),
      ])
      const user = userJson ? (JSON.parse(userJson) as User) : null
      set({ isLoading: false, isAuthenticated: !!token, user })
    } catch {
      set({ isLoading: false, isAuthenticated: false, user: null })
    }
  },

  login: async (tokens, user) => {
    await Promise.all([setTokens(tokens), SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))])
    set({ isLoading: false, isAuthenticated: true, user })
  },

  biometricLogin: async () => {
    // Throws APIClientError if no refresh token is stored or the server rejects it.
    // Caller should catch and show an error snackbar.
    await refreshSession()
    const userJson = await SecureStore.getItemAsync(USER_KEY)
    const user = userJson ? (JSON.parse(userJson) as User) : null
    set({ isLoading: false, isAuthenticated: true, user })
  },

  logout: async () => {
    // Best-effort deregister — must run BEFORE clearTokens so the auth header
    // is still attached. Failures are swallowed inside the helper.
    await deregisterPushTokenWithServer()
    await Promise.all([clearTokens(), SecureStore.deleteItemAsync(USER_KEY)])
    set({ isLoading: false, isAuthenticated: false, user: null })
    router.replace('/(auth)/login')
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }))
  },
}))
