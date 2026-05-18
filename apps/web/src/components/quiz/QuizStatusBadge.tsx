import type { QuizStatus } from '@/types/quiz'

interface QuizStatusBadgeProps {
  status: QuizStatus
}

export function QuizStatusBadge({ status }: QuizStatusBadgeProps) {
  if (status === 'published') {
    return (
      <span className="rounded-full bg-correct-soft px-2.5 py-1 text-[11px] font-semibold text-correct">
        Published
      </span>
    )
  }
  return (
    <span className="rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
      Draft
    </span>
  )
}
