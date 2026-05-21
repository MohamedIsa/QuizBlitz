import { useState, useCallback, useRef } from 'react'

type ServerStatus = 'checking' | 'up' | 'down'

const HEALTH_URL =
  (process.env.EXPO_PUBLIC_API_URL_LOCAL ?? process.env.EXPO_PUBLIC_API_URL ?? '') + '/health'

if (__DEV__) console.log('[useServerStatus] health URL:', HEALTH_URL)

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus>('checking')
  const [isRetrying, setIsRetrying] = useState(false)
  const hasCheckedOnce = useRef(false)

  const check = useCallback(async () => {
    if (hasCheckedOnce.current) {
      // Subsequent calls: show retrying spinner, keep 'down' screen visible
      setIsRetrying(true)
    } else {
      // First call: stay in 'checking' so splash screen holds
      setStatus('checking')
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    try {
      const res = await fetch(HEALTH_URL, { signal: controller.signal })
      setStatus(res.ok ? 'up' : 'down')
    } catch (e) {
      if (__DEV__) console.log('[useServerStatus] health check failed:', e)
      setStatus('down')
    } finally {
      clearTimeout(timer)
      hasCheckedOnce.current = true
      setIsRetrying(false)
    }
  }, [])

  return { status, isRetrying, check }
}
