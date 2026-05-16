import {
  create as axiosCreate,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosResponseHeaders,
  InternalAxiosRequestConfig,
} from 'axios'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { pinnedFetch, PUBLIC_KEY_HASHES } from '@/lib/secureFetch'
import { getMockResponse } from './mock-handlers'

const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_API === 'true'

if (MOCK_MODE && process.env.EXPO_PUBLIC_ENV === 'production') {
  throw new Error(
    '[api-client] FATAL: EXPO_PUBLIC_MOCK_API=true in a production build. ' +
      'Set EXPO_PUBLIC_MOCK_API=false in your production env configuration.',
  )
}

// ─── Module augmentation ───────────────────────────────────────────────────
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
    _retry?: boolean
  }
}

// ─── Token storage keys ────────────────────────────────────────────────────
const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  SESSION: 'session_id',
} as const

// ─── Base URL ──────────────────────────────────────────────────────────────
const BASE_URL =
  (process.env.EXPO_PUBLIC_ENV === 'production'
    ? process.env.EXPO_PUBLIC_API_URL
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_API_URL_LOCAL ?? process.env.EXPO_PUBLIC_API_URL,
        android: process.env.EXPO_PUBLIC_API_URL_LOCAL ?? process.env.EXPO_PUBLIC_API_URL,
        default: process.env.EXPO_PUBLIC_API_URL,
      })) ?? ''

if (process.env.EXPO_PUBLIC_ENV === 'production') {
  if (!BASE_URL) {
    throw new Error('[api-client] EXPO_PUBLIC_API_URL is required in production builds')
  }
  if (!BASE_URL.startsWith('https://')) {
    console.warn(`[api-client] Production API URL is not HTTPS — this is insecure: ${BASE_URL}`)
  }
}

// ─── Error class ──────────────────────────────────────────────────────────
export class APIClientError<T = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: T,
  ) {
    super(message)
    this.name = 'APIClientError'
  }
}

// ─── Refresh queue ────────────────────────────────────────────────────────
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void }

let isRefreshing = false
let refreshQueue: QueueEntry[] = []

function processQueue(error: unknown, token: string | null = null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else if (token) resolve(token)
  })
  refreshQueue = []
}

// ─── Pinned fetch adapter ─────────────────────────────────────────────────
// Replaces axios's default XMLHttpRequest adapter with the SSL-pinned fetch
// from react-native-ssl-public-key-pinning.
//
// Why swap the entire adapter instead of using secureFetch separately?
// Axios uses XHR on React Native — the pinning library wraps `fetch`, not XHR.
// Without this adapter, every axios call bypasses pinning entirely.
// By replacing the transport here, ALL calls through apiClient are pinned
// while the full interceptor stack (token refresh, error normalisation) is kept.
//
// Limitation: onUploadProgress is not supported (fetch has no upload-progress API).
// The upload() method accepts the callback but it will not be invoked on native.
async function pinnedFetchAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  // ── Mock mode ────────────────────────────────────────────────────────────
  if (MOCK_MODE) {
    const mock = await getMockResponse(
      config.method ?? 'get',
      config.url ?? '',
      config.data ? JSON.parse(config.data as string) : undefined,
    )
    const axiosMock: AxiosResponse = {
      data: mock.data,
      status: mock.status,
      statusText: 'OK',
      headers: {},
      config,
    }
    const validateStatus = config.validateStatus ?? ((s: number) => s >= 200 && s < 300)
    if (!validateStatus(mock.status)) {
      throw new AxiosError(
        `Request failed with status code ${mock.status}`,
        'ERR_BAD_REQUEST',
        config,
        null,
        axiosMock,
      )
    }
    return axiosMock
  }

  // ── Build URL ────────────────────────────────────────────────────────────
  const rawUrl = config.url ?? ''
  const base = config.baseURL ?? ''
  const url = new URL(rawUrl.startsWith('http') ? rawUrl : `${base}${rawUrl}`)

  if (config.params) {
    Object.entries(config.params as Record<string, unknown>).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, String(v))
    })
  }

  // ── Build headers ────────────────────────────────────────────────────────
  const headers: Record<string, string> = {}
  if (config.headers) {
    const raw =
      typeof config.headers.toJSON === 'function'
        ? (config.headers.toJSON() as Record<string, unknown>)
        : (config.headers as Record<string, unknown>)

    Object.entries(raw).forEach(([k, v]) => {
      if (v != null && typeof v !== 'object') headers[k] = String(v)
    })
  }

  // ── Build body ───────────────────────────────────────────────────────────
  let body: string | FormData | undefined
  if (config.data instanceof FormData) {
    body = config.data
    // Let the runtime set the correct multipart boundary
    delete headers['Content-Type']
  } else if (config.data != null) {
    body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
  }

  // ── Timeout via AbortController ──────────────────────────────────────────
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  if (config.timeout && config.timeout > 0) {
    timeoutId = setTimeout(() => controller.abort(), config.timeout)
  }

  // ── Execute request ──────────────────────────────────────────────────────
  let response: Response

  try {
    const fetchOptions: RequestInit = {
      method: (config.method ?? 'get').toUpperCase(),
      headers,
      body,
      signal: controller.signal,
    }

    if (url.protocol === 'https:' && pinnedFetch !== null && PUBLIC_KEY_HASHES.length > 0) {
      response = await pinnedFetch(url.toString(), fetchOptions, {
        publicKeyHashes: PUBLIC_KEY_HASHES,
      })
    } else {
      response = await fetch(url.toString(), fetchOptions)
    }
  } catch (err) {
    clearTimeout(timeoutId)
    const isAbort = err instanceof Error && err.name === 'AbortError'
    const message = isAbort
      ? `timeout of ${config.timeout}ms exceeded`
      : err instanceof Error
        ? err.message
        : 'Network error'
    const axiosErr = new AxiosError(message, isAbort ? 'ECONNABORTED' : 'ERR_NETWORK', config)
    if (err instanceof Error) axiosErr.cause = err
    throw axiosErr
  }

  clearTimeout(timeoutId)

  // ── Parse response body ──────────────────────────────────────────────────
  let data: unknown

  switch (config.responseType) {
    case 'blob':
      data = await response.blob()
      break
    case 'arraybuffer':
      data = await response.arrayBuffer()
      break
    case 'text':
      data = await response.text()
      break
    default: {
      const text = await response.text()
      try {
        data = text.length > 0 ? JSON.parse(text) : null
      } catch {
        data = text
      }
    }
  }

  // ── Convert headers ──────────────────────────────────────────────────────
  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((v, k) => {
    responseHeaders[k] = v
  })

  const axiosResponse: AxiosResponse = {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    config,
  }

  // ── Validate status (default: 2xx) ───────────────────────────────────────
  const validateStatus = config.validateStatus ?? ((s: number) => s >= 200 && s < 300)

  if (!validateStatus(response.status)) {
    throw new AxiosError(
      `Request failed with status code ${response.status}`,
      response.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST',
      config,
      null,
      axiosResponse,
    )
  }

  return axiosResponse
}

// ─── Axios instance ───────────────────────────────────────────────────────
const instance: AxiosInstance = axiosCreate({
  baseURL: BASE_URL,
  timeout: 15_000,
  adapter: pinnedFetchAdapter,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Request interceptor ───────────────────────────────────────────────────
instance.interceptors.request.use(
  async (config) => {
    if (config.skipAuth) return config

    const [accessToken, sessionId] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEYS.ACCESS),
      SecureStore.getItemAsync(TOKEN_KEYS.SESSION),
    ])

    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    if (sessionId) config.headers['X-Session-Id'] = sessionId

    return config
  },
  (error: unknown) => Promise.reject(error),
)

// ─── Response interceptor ─────────────────────────────────────────────────
instance.interceptors.response.use(
  (response) => {
    // Unwrap the server's { success: true, data: T } envelope transparently.
    // All callers receive T directly — no envelope handling needed at the call site.
    const d = response.data as { success?: boolean; data?: unknown } | null
    if (d && typeof d === 'object' && d.success === true && 'data' in d) {
      response.data = d.data
    }
    return response
  },
  async (error: AxiosError) => {
    const original = error.config

    if (!original || error.response?.status !== 401 || original._retry || original.skipAuth) {
      return Promise.reject(toClientError(error))
    }

    // Queue concurrent 401s until the refresh completes
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((newToken) => {
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${newToken}`
        return instance(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const newToken = await doTokenRefresh()
      processQueue(null, newToken)
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${newToken}`
      return instance(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      await clearTokens()
      return Promise.reject(toClientError(error))
    } finally {
      isRefreshing = false
    }
  },
)

// ─── Token helpers ─────────────────────────────────────────────────────────
async function doTokenRefresh(): Promise<string> {
  const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH)
  if (!refreshToken) throw new APIClientError('No refresh token stored', 401, null)

  const data = await instance
    .post<{ accessToken: string; refreshToken?: string }>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true },
    )
    .then((r) => r.data)

  await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, data.accessToken)
  if (data.refreshToken) {
    await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, data.refreshToken)
  }

  return data.accessToken
}

export async function refreshSession(): Promise<string> {
  return doTokenRefresh()
}

export async function setTokens(params: {
  accessToken: string
  refreshToken: string
  sessionId?: string
}): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, params.accessToken),
    SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, params.refreshToken),
    params.sessionId
      ? SecureStore.setItemAsync(TOKEN_KEYS.SESSION, params.sessionId)
      : Promise.resolve(),
  ])
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS),
    SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH),
    SecureStore.deleteItemAsync(TOKEN_KEYS.SESSION),
  ])
}

// ─── Error normalizer ─────────────────────────────────────────────────────
function toClientError(error: AxiosError): APIClientError {
  const status = error.response?.status ?? 0
  const data = error.response?.data as Record<string, unknown> | undefined
  const message =
    (data?.message as string | undefined) ??
    (data?.error as string | undefined) ??
    error.message ??
    'An unexpected error occurred'

  return new APIClientError(message, status, data ?? null)
}

// ─── Request options ──────────────────────────────────────────────────────
interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean
}

// ─── API client ───────────────────────────────────────────────────────────
export const apiClient = {
  /** Fetch a resource or list. `params` are appended as query-string. */
  get<T>(url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<T> {
    return instance.get<T>(url, { params, ...options }).then((r) => r.data)
  },

  /** Create a resource or submit an action. */
  post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return instance.post<T>(url, data, options).then((r) => r.data)
  },

  /** Replace a resource entirely. */
  put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return instance.put<T>(url, data, options).then((r) => r.data)
  },

  /** Apply a partial update to a resource. */
  patch<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return instance.patch<T>(url, data, options).then((r) => r.data)
  },

  /** Remove a resource. */
  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return instance.delete<T>(url, options).then((r) => r.data)
  },

  /**
   * Fetch response headers only — no body transferred.
   * Use to check resource existence or read Content-Length before a full download.
   */
  head(url: string, options?: RequestOptions): Promise<AxiosResponseHeaders> {
    return instance.head(url, options).then((r) => r.headers as AxiosResponseHeaders)
  },

  /**
   * Discover the HTTP methods allowed on a resource.
   * Check `Allow` / `Access-Control-Allow-Methods` on the returned headers.
   */
  options(url: string, options?: RequestOptions): Promise<AxiosResponseHeaders> {
    return instance.options(url, options).then((r) => r.headers as AxiosResponseHeaders)
  },

  /**
   * Multipart/form-data POST.
   * NOTE: `onProgress` is not invoked on native — the fetch API has no upload-progress event.
   * The upload is still pinned and secure; progress tracking is simply unavailable.
   */
  upload<T>(
    url: string,
    formData: FormData,
    options?: RequestOptions,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    return instance
      .post<T>(url, formData, {
        ...options,
        headers: { ...options?.headers, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (evt) => {
              const total = evt.total ?? evt.loaded
              onProgress(total > 0 ? evt.loaded / total : 0)
            }
          : undefined,
      })
      .then((r) => r.data)
  },

  /** GET that returns a Blob — for downloading images, PDFs, or binary files. */
  download(url: string, options?: RequestOptions): Promise<Blob> {
    return instance.get<Blob>(url, { ...options, responseType: 'blob' }).then((r) => r.data)
  },
}
