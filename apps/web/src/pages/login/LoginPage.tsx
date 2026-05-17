import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Turnstile } from '@marsidev/react-turnstile'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth'
import type { Envelope } from '@/lib/api-client'
import type { AuthUser } from '@/store/auth'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginInput = z.infer<typeof loginSchema>

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

// ─── Component ────────────────────────────────────────────────────────────────

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string

export function LoginPage() {
  const navigate = useNavigate()
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await apiClient.post<Envelope<LoginResponse>>('/auth/login', {
        email: data.email,
        password: data.password,
        turnstileToken: turnstileToken!,
      })
      return res.data.data
    },
    onSuccess: (data) => {
      useAuthStore.getState().login(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        { id: data.user.id, email: data.user.email, displayName: data.user.displayName },
      )
      navigate('/dashboard')
    },
    onError: (err: Error) => {
      form.setError('root', { message: err.message })
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    },
  })

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data))

  return (
    <div className="flex h-screen">
      {/* ── Left brand panel ──────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-stage-night p-12">
        {/* Decorative gradient stroke */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6E3FF3" />
              <stop offset="1" stopColor="#FFD24A" />
            </linearGradient>
          </defs>
          <path
            d="M250 -50 L80 320 H260 L150 720"
            stroke="url(#lg)"
            strokeWidth="170"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet">
            <span className="font-display text-sm font-bold text-white">QB</span>
          </div>
          <span className="font-display text-lg font-bold text-white">QuizBlitz</span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 mt-auto">
          <p className="font-display text-[46px] font-bold leading-[1.05] tracking-[-1.5px] text-white">
            Quizzes your<br />room won't shut up about.
          </p>
          <p className="mt-4 max-w-[420px] text-[15px] leading-relaxed text-white/70">
            Build, run, and review live quizzes for 500 players at once — from any device.
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────── */}
      <div className="flex w-[460px] flex-col justify-center px-12">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.5px] text-ink">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-muted">Sign in to host a quiz.</p>

        <form onSubmit={onSubmit} noValidate>
          <div className="mt-7 grid gap-3.5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-soft">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-muted">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-[10px] border border-ink-border bg-surface py-3 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-wrong">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-soft">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-muted">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-[10px] border border-ink-border bg-surface py-3 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
                  {...form.register('password')}
                />
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-wrong">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Root / server error */}
          {form.formState.errors.root && (
            <p className="mt-3 rounded-[10px] bg-wrong-soft px-4 py-2.5 text-sm text-wrong">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* Turnstile */}
          <div className="mt-4">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !turnstileToken}
            className="mt-5 w-full rounded-[10px] bg-violet py-3 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-2.5">
          <div className="h-px flex-1 bg-ink-border" />
          <span className="text-[11px] uppercase tracking-[1px] text-ink-muted">or</span>
          <div className="h-px flex-1 bg-ink-border" />
        </div>

        {/* Google */}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-ink-border bg-surface py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 12c0-.6 0-1.2-.2-1.8H12v3.6h5.6c-.2 1.3-1 2.4-2 3.2v2.6h3.4c2-1.8 3-4.6 3-7.6z" fill="#4285F4" />
            <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.4-2.6c-.9.6-2 1-3.2 1-2.6 0-4.7-1.7-5.5-4H3v2.6C4.6 19.6 8 22 12 22z" fill="#34A853" />
            <path d="M6.5 14c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-2V7.5H3a10 10 0 000 9l3.5-2.5z" fill="#FBBC05" />
            <path d="M12 6.4c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 3.5 14.6 2.5 12 2.5c-4 0-7.4 2.4-9 5.7l3.5 2.6c.8-2.3 2.9-4 5.5-4z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-7 text-center text-[12.5px] text-ink-muted">
          Don't have an account?{' '}
          <span className="cursor-pointer font-semibold text-violet">Sign up</span>
        </p>
      </div>
    </div>
  )
}
