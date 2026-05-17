import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function DashboardPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
          {user && (
            <p className="mt-1 text-sm text-ink-muted">Welcome back, {user.displayName}.</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="rounded-[10px] border border-ink-border px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-2"
        >
          Log out
        </button>
      </div>
      <p className="mt-8 text-ink-muted">Coming soon.</p>
    </div>
  )
}
