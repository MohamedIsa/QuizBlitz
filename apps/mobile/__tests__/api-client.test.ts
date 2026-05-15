// Dynamic require() is required here: this test calls `jest.resetModules()`
// in beforeEach, then re-requires `@/core/api-client` to pick up the fresh
// module state and re-bound mock factories. Static `import` statements are
// hoisted and would defeat that pattern.
/* eslint-disable @typescript-eslint/no-require-imports */

// Override `.env` before any module loads — `.env` defaults MOCK_MODE=true
// which would bypass fetch entirely. `EXPO_PUBLIC_*` values are read at
// module-load time, so we set them as Node env BEFORE require().
process.env.EXPO_PUBLIC_MOCK_API = 'false'
process.env.EXPO_PUBLIC_ENV = 'development'
process.env.EXPO_PUBLIC_API_URL = 'http://test-api.local'
process.env.EXPO_PUBLIC_API_URL_LOCAL = 'http://test-api.local'

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}))

jest.mock('@/lib/secureFetch', () => ({
  pinnedFetch: null,
  PUBLIC_KEY_HASHES: [],
}))

interface MockResp {
  status: number
  body: unknown
  headers?: Record<string, string>
}

function fakeResponse({ status, body, headers = {} }: MockResp): Response {
  return {
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: {
      forEach: (fn: (v: string, k: string) => void) => {
        Object.entries(headers).forEach(([k, v]) => fn(v, k))
      },
    },
  } as unknown as Response
}

type ApiClient = typeof import('@/core/api-client').apiClient
let apiClient: ApiClient
let mockFetch: jest.Mock
let mockGet: jest.Mock
let mockSet: jest.Mock
let mockDelete: jest.Mock

// Stateful SecureStore — `setItemAsync` mutations are visible to subsequent
// `getItemAsync` calls. Needed so refresh-flow retries pick up the new token.
let storage: Map<string, string>

function setupModule() {
  jest.resetModules()
  mockFetch = jest.fn()
  ;(global as unknown as { fetch: jest.Mock }).fetch = mockFetch
  // After resetModules, mock factories run again — re-fetch the mock fns so
  // we hold the same instance the api-client now sees.
  const SecureStore = require('expo-secure-store')
  mockGet = SecureStore.getItemAsync
  mockSet = SecureStore.setItemAsync
  mockDelete = SecureStore.deleteItemAsync
  storage = new Map<string, string>([
    ['access_token', 'test-access-token'],
    ['refresh_token', 'test-refresh-token'],
  ])
  mockGet.mockImplementation((key: string) => Promise.resolve(storage.get(key) ?? null))
  mockSet.mockImplementation((key: string, value: string) => {
    storage.set(key, value)
    return Promise.resolve()
  })
  mockDelete.mockImplementation((key: string) => {
    storage.delete(key)
    return Promise.resolve()
  })
  apiClient = require('@/core/api-client').apiClient
}

beforeEach(() => {
  setupModule()
})

describe('apiClient — request headers', () => {
  it('attaches Authorization Bearer from SecureStore', async () => {
    mockFetch.mockResolvedValueOnce(fakeResponse({ status: 200, body: { ok: true } }))

    await apiClient.get('/users/me')

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [, options] = mockFetch.mock.calls[0]
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-access-token',
    })
  })

  it('does NOT attach Authorization when skipAuth is true', async () => {
    mockFetch.mockResolvedValueOnce(fakeResponse({ status: 200, body: { ok: true } }))

    await apiClient.get('/health', undefined, { skipAuth: true })

    const [, options] = mockFetch.mock.calls[0]
    const headers = (options as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it('attaches X-Session-Id header when session_id is stored', async () => {
    storage.set('session_id', 'session-abc')
    mockFetch.mockResolvedValueOnce(fakeResponse({ status: 200, body: { ok: true } }))

    await apiClient.get('/users/me')

    const [, options] = mockFetch.mock.calls[0]
    expect((options as RequestInit).headers).toMatchObject({
      'X-Session-Id': 'session-abc',
    })
  })
})

describe('apiClient — 401 refresh flow', () => {
  it('refreshes and retries the original request after a 401', async () => {
    mockFetch
      .mockResolvedValueOnce(fakeResponse({ status: 401, body: { error: 'unauthorized' } }))
      .mockResolvedValueOnce(fakeResponse({ status: 200, body: { access_token: 'new-token' } }))
      .mockResolvedValueOnce(fakeResponse({ status: 200, body: { id: 1, name: 'Alice' } }))

    const result = await apiClient.get<{ id: number; name: string }>('/users/me')

    expect(result).toEqual({ id: 1, name: 'Alice' })
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(String(mockFetch.mock.calls[1][0])).toContain('/auth/refresh')
    const retryHeaders = (mockFetch.mock.calls[2][1] as RequestInit).headers as Record<
      string,
      string
    >
    expect(retryHeaders.Authorization).toBe('Bearer new-token')
  })

  it('coalesces concurrent 401s — only one refresh call is made', async () => {
    const queue: Record<string, Response[]> = {
      '/first': [
        fakeResponse({ status: 401, body: {} }),
        fakeResponse({ status: 200, body: { result: 'a' } }),
      ],
      '/second': [
        fakeResponse({ status: 401, body: {} }),
        fakeResponse({ status: 200, body: { result: 'b' } }),
      ],
      '/auth/refresh': [fakeResponse({ status: 200, body: { access_token: 'new-token' } })],
    }

    mockFetch.mockImplementation((url: string) => {
      const urlStr = String(url)
      for (const key of Object.keys(queue)) {
        if (urlStr.includes(key)) {
          const resp = queue[key].shift()
          if (!resp) throw new Error(`No more mock responses for ${key}`)
          return Promise.resolve(resp)
        }
      }
      throw new Error(`Unexpected fetch: ${urlStr}`)
    })

    const [resA, resB] = await Promise.all([
      apiClient.get<{ result: string }>('/first'),
      apiClient.get<{ result: string }>('/second'),
    ])

    expect(resA).toEqual({ result: 'a' })
    expect(resB).toEqual({ result: 'b' })

    const refreshCalls = mockFetch.mock.calls.filter((c) => String(c[0]).includes('/auth/refresh'))
    expect(refreshCalls).toHaveLength(1)
  })

  it('clears tokens and rejects when the refresh call fails', async () => {
    mockFetch
      .mockResolvedValueOnce(fakeResponse({ status: 401, body: {} }))
      .mockResolvedValueOnce(fakeResponse({ status: 401, body: { error: 'refresh denied' } }))

    await expect(apiClient.get('/users/me')).rejects.toMatchObject({
      name: 'APIClientError',
    })

    expect(mockDelete).toHaveBeenCalledWith('access_token')
    expect(mockDelete).toHaveBeenCalledWith('refresh_token')
    expect(mockDelete).toHaveBeenCalledWith('session_id')
  })

  it('rejects with APIClientError when no refresh token is stored', async () => {
    storage.delete('refresh_token')
    mockFetch.mockResolvedValueOnce(fakeResponse({ status: 401, body: {} }))

    await expect(apiClient.get('/users/me')).rejects.toMatchObject({
      name: 'APIClientError',
    })
    const refreshCalls = mockFetch.mock.calls.filter((c) => String(c[0]).includes('/auth/refresh'))
    expect(refreshCalls).toHaveLength(0)
  })
})

describe('apiClient — timeout', () => {
  it('rejects with a timeout message when timeout exceeds', async () => {
    mockFetch.mockImplementation((_url: string, opts: RequestInit) => {
      return new Promise((_resolve, reject) => {
        opts.signal?.addEventListener('abort', () => {
          const err = new Error('Aborted')
          err.name = 'AbortError'
          reject(err)
        })
      })
    })

    await expect(apiClient.get('/slow', undefined, { timeout: 50 })).rejects.toThrow(/timeout/i)
  })
})

describe('apiClient — MOCK_MODE', () => {
  it('returns mock-handler responses without hitting the network', async () => {
    const originalMock = process.env.EXPO_PUBLIC_MOCK_API
    process.env.EXPO_PUBLIC_MOCK_API = 'true'

    let mockedClient: ApiClient
    let mockGetMockResponse: jest.Mock

    jest.isolateModules(() => {
      jest.doMock('@/core/mock-handlers', () => ({
        getMockResponse: jest.fn().mockResolvedValue({ status: 200, data: { mocked: true } }),
      }))
      mockedClient = require('@/core/api-client').apiClient
      mockGetMockResponse = require('@/core/mock-handlers').getMockResponse
    })

    const result = await mockedClient!.get('/anything')

    expect(result).toEqual({ mocked: true })
    expect(mockGetMockResponse!).toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()

    process.env.EXPO_PUBLIC_MOCK_API = originalMock
  })
})
