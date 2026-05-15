import type { User } from '@/store/auth'

export function getInitials(user: User | null | undefined): string {
  if (!user) return '?'

  const trimmed = user.name?.trim()
  if (trimmed) {
    const initials = trimmed
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase()
    if (initials) return initials
  }

  return user.email?.[0]?.toUpperCase() ?? '?'
}
