import { useNavigate } from 'react-router-dom'
import type { Quiz } from '@/types/quiz'
import { QuizStatusBadge } from './QuizStatusBadge'
import { formatRelativeTime } from '@/lib/format'

interface QuizCardProps {
  quiz: Quiz
}

// All four variants listed explicitly so Tailwind scans them
const CARD_ACCENTS = [
  { corner: 'bg-violet/10', iconBg: 'bg-violet/10', iconText: 'text-violet' },
  { corner: 'bg-correct/10', iconBg: 'bg-correct/10', iconText: 'text-correct' },
  { corner: 'bg-yellow-deep/10', iconBg: 'bg-yellow-deep/10', iconText: 'text-yellow-deep' },
  { corner: 'bg-q1/10', iconBg: 'bg-q1/10', iconText: 'text-q1' },
] as const

type CardAccent = (typeof CARD_ACCENTS)[number]

function getAccent(id: string): CardAccent {
  return CARD_ACCENTS[id.charCodeAt(0) % CARD_ACCENTS.length]
}

export function QuizCard({ quiz }: QuizCardProps) {
  const navigate = useNavigate()
  const accent = getAccent(quiz.id)

  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-border bg-surface p-[18px]">
      {/* Decorative corner */}
      <div className={`absolute right-0 top-0 h-[100px] w-[100px] ${accent.corner} [border-radius:0_16px_0_80%]`} />

      {/* Icon + badge */}
      <div className="relative flex items-start justify-between">
        {quiz.coverImageUrl ? (
          <img
            src={quiz.coverImageUrl}
            alt=""
            className="h-11 w-11 rounded-xl border border-ink-border object-cover"
          />
        ) : (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${accent.iconBg}`}>
            📋
          </div>
        )}
        <QuizStatusBadge status={quiz.status} />
      </div>

      {/* Title */}
      <h3 className="relative mt-4 font-display text-[17px] font-bold leading-snug tracking-[-0.3px] text-ink">
        {quiz.title}
      </h3>

      {/* Divider */}
      <div className="my-3.5 h-px bg-border-soft" />

      {/* Footer */}
      <div className="flex items-center gap-2">
        <span className="flex-1 text-[11px] text-ink-muted">
          Edited {formatRelativeTime(quiz.updatedAt)}
        </span>
        <button
          type="button"
          onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
          className="rounded-[8px] border border-ink-border px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft transition-colors hover:bg-surface-2"
        >
          Edit
        </button>
        {quiz.status === 'published' && (
          <button
            type="button"
            onClick={() => alert('Live sessions coming in Phase 2')}
            className="rounded-[8px] bg-violet px-3 py-1.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Launch
          </button>
        )}
      </div>
    </div>
  )
}
