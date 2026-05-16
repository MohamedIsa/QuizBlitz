import { apiClient } from '@/core/api-client'

// ─── Shared types ─────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  displayName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

// ─── Auth service ─────────────────────────────────────────────────────────

export const authService = {
  login(email: string, password: string, turnstileToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password, turnstileToken })
  },

  register(params: {
    displayName: string
    email: string
    password: string
    turnstileToken: string
  }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', params)
  },

  forgotPassword(email: string): Promise<void> {
    return apiClient.post('/auth/forgot-password', { email }, { skipAuth: true })
  },

  verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    return apiClient.post<{ resetToken: string }>(
      '/auth/verify-otp',
      { email, otp },
      { skipAuth: true },
    )
  },

  resetPassword(resetToken: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/reset-password', { resetToken, newPassword }, { skipAuth: true })
  },

  getMe(accessToken: string): Promise<AuthUser> {
    return apiClient.get<AuthUser>(
      '/auth/me',
      undefined,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
  },
}

