import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import type { AuthUser } from '@/store/auth'

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split('.')[1]
  // JWT uses URL-safe base64 (RFC 4648) — atob requires standard base64
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      navigate('/login?error=oauth_failed', { replace: true })
      return
    }

    try {
      const payload = decodeJwtPayload(accessToken)
      const email = (payload.email as string) ?? ''
      const user: AuthUser = {
        id: payload.sub as string,
        email,
        displayName: (payload.displayName as string) ?? email.split('@')[0],
      }
      useAuthStore.getState().login({ accessToken, refreshToken }, user)
      navigate('/dashboard', { replace: true })
    } catch {
      navigate('/login?error=oauth_failed', { replace: true })
    }
  }, [navigate, searchParams])

  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <p className="text-sm text-ink-muted">Signing you in…</p>
    </div>
  )
}
