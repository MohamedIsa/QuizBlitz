import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

export type { User } from '@/store/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s._initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return <>{children}</>
}
