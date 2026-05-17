import { create } from 'zustand'

export interface AuthUser {
  id: string
  email: string
  displayName: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  login(tokens: { accessToken: string; refreshToken: string }, user: AuthUser): void
  logout(): void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  login: (tokens, user) => set({ ...tokens, user }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null }),
}))
