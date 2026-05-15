import { Platform } from 'react-native'

// ─── Base URL ──────────────────────────────────────────────────────────────
export const API_URL = (
  process.env.EXPO_PUBLIC_ENV === 'production'
    ? process.env.EXPO_PUBLIC_API_URL
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_API_URL_LOCAL ?? process.env.EXPO_PUBLIC_API_URL,
        android: process.env.EXPO_PUBLIC_API_URL_LOCAL ?? process.env.EXPO_PUBLIC_API_URL,
        default: process.env.EXPO_PUBLIC_API_URL,
      })
) ?? ''

// True only when the resolved API URL uses HTTPS — pinning is meaningless (and
// impossible to set up) on plain HTTP, so the entire pinning path is skipped for
// local / dev servers that run without a certificate.
export const isHttps = API_URL.startsWith('https://')

// ─── SPKI public key hashes ────────────────────────────────────────────────
// Store in .env:  EXPO_PUBLIC_SPKI_HASH_1=sha256/AAAA...
//                 EXPO_PUBLIC_SPKI_HASH_2=sha256/BBBB...  ← backup key (required for rotation)
//
// Generate for a live server:
//   openssl s_client -connect host:443 </dev/null 2>/dev/null \
//     | openssl x509 -pubkey -noout \
//     | openssl pkey -pubin -outform der \
//     | openssl dgst -sha256 -binary \
//     | base64
//
// Always ship ≥2 hashes so you can rotate the key without a forced app update.
export const PUBLIC_KEY_HASHES = [
  "ADD_YOUR_HASHES_HERE", // <-- REPLACE THIS
].filter((h): h is string => Boolean(h))

// ─── Pinned fetch loader ───────────────────────────────────────────────────
// The library wraps the fetch API with SPKI hash verification at the native layer.
// It is a native module — requires expo prebuild (or bare workflow) to function.
// On web and in Expo Go it degrades gracefully to unpinned fetch with a dev warning.

export type PinnedFetch = (
  url: string,
  options: RequestInit,
  pinning: { publicKeyHashes: string[] },
) => Promise<Response>

function loadPinnedFetch(): PinnedFetch | null {
  if (Platform.OS === 'web') return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require('react-native-ssl-public-key-pinning') as { fetch: PinnedFetch }).fetch
  } catch {
    // Only warn when the target is HTTPS — on HTTP there is no cert to pin against
    // and the fallback to regular fetch is correct and expected.
    if (__DEV__ && isHttps) {
      console.warn(
        '[secureFetch] react-native-ssl-public-key-pinning unavailable.\n' +
          'Run `expo prebuild` to activate public key pinning for HTTPS environments.',
      )
    }
    return null
  }
}

// Loaded once at module init — shared by secureFetch and the axios adapter.
export const pinnedFetch = loadPinnedFetch()

// ─── secureFetch ──────────────────────────────────────────────────────────
// Standalone pinned fetch for calls that intentionally bypass the axios
// middleware stack: unauthenticated health checks, presigned S3 URLs, or any
// request going to a host other than BASE_URL.
//
// For all normal API calls use `apiClient` — it runs the same pinned transport
// plus token injection, refresh, and error normalisation.
export async function secureFetch<T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  let response: Response

  if (isHttps && pinnedFetch !== null && PUBLIC_KEY_HASHES.length > 0) {
    response = await pinnedFetch(url, options ?? {}, { publicKeyHashes: PUBLIC_KEY_HASHES })
  } else {
    response = await fetch(url, options ?? {})
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json() as T
}
