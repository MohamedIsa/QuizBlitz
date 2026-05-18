import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="8" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    to: '/quizzes',
    label: 'My quizzes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/live',
    label: 'Live sessions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M5 12a7 7 0 0114 0M7.5 12a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 20h18M6 17v-7M11 17V7M16 17v-5M21 17V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/audience',
    label: 'Audience',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 4a3 3 0 010 6M21 20c0-2-1.5-4-4-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5h0a1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function HostSidebar() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const initial = user?.displayName?.charAt(0).toUpperCase() ?? '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-ink-border bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-border-soft px-[18px] py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet">
          <span className="font-display text-xs font-bold text-white">QB</span>
        </div>
        <span className="font-display text-[15px] font-bold text-ink">QuizBlitz</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `mb-0.5 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-violet-tint font-semibold text-violet'
                  : 'text-ink-soft hover:bg-surface-2'
              }`
            }
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border-soft p-3">
        <div className="flex items-center gap-2.5 rounded-[10px] p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet text-xs font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-ink">
              {user?.displayName ?? 'Host'}
            </p>
            <p className="truncate text-[11px] text-ink-muted">{user?.email ?? ''}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="shrink-0 rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink-soft"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
