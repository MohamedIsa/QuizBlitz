import { useCallback, useEffect, useState } from 'react'
import { checkForUpdate, fetchAndApplyUpdate } from '@/lib/updates'

export function useUpdates() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    let cancelled = false
    checkForUpdate().then((available) => {
      if (!cancelled) setIsUpdateAvailable(available)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const applyUpdate = useCallback(async () => {
    setIsApplying(true)
    try {
      await fetchAndApplyUpdate()
    } catch {
      setIsApplying(false)
    }
  }, [])

  return { isUpdateAvailable, isApplying, applyUpdate }
}
