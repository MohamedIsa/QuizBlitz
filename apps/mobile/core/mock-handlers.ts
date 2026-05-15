// Mock responses for UI/validation development — no backend required.
// Enable by setting EXPO_PUBLIC_MOCK_API=true in .env

const DELAY_MS = 800

type MockBody = Record<string, unknown>

interface MockResponse {
  status: number
  data: unknown
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getMockResponse(
  method: string,
  path: string,
  body: unknown,
): Promise<MockResponse> {
  await delay(DELAY_MS)

  const m = method.toUpperCase()
  const b = (body ?? {}) as MockBody

  // ── Auth ────────────────────────────────────────────────────────────────────

  if (m === 'POST' && path.includes('/auth/login')) {
    return {
      status: 200,
      data: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-1',
          email: b['email'] ?? 'demo@example.com',
          name: 'Demo User',
        },
      },
    }
  }

  if (m === 'POST' && path.includes('/auth/register')) {
    return {
      status: 201,
      data: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-1',
          email: b['email'] ?? 'demo@example.com',
          name: b['name'] ?? 'New User',
        },
      },
    }
  }

  if (m === 'POST' && path.includes('/auth/forgot-password')) {
    return { status: 200, data: { message: 'Reset link sent' } }
  }

  if (m === 'POST' && path.includes('/auth/refresh')) {
    return {
      status: 200,
      data: {
        access_token: 'mock-access-token-refreshed',
        refresh_token: 'mock-refresh-token-refreshed',
      },
    }
  }

  // ── Push notifications ──────────────────────────────────────────────────────

  if (m === 'POST' && path.includes('/users/me/push-token')) {
    return { status: 200, data: { ok: true, token: b['token'] ?? null } }
  }

  if (m === 'DELETE' && path.includes('/users/me/push-token')) {
    return { status: 200, data: { ok: true } }
  }

  // ── Fallback ────────────────────────────────────────────────────────────────

  if (__DEV__) {
    console.warn(`[mock] Unhandled ${m} ${path} — returning 200 {}`)
  }
  return { status: 200, data: {} }
}
