import { useAuthStore } from '@/store/auth'

export function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  return (
    <div className="p-8">
      <h1 className="font-display text-[26px] font-bold tracking-[-0.5px] text-ink">
        Good to see you, {firstName}.
      </h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        Dashboard content coming soon.
      </p>
    </div>
  )
}
