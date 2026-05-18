import type { UseFormRegisterReturn } from 'react-hook-form'

// All four colour classes listed explicitly so Tailwind scans them
const ANSWER_BG = ['bg-q1', 'bg-q2', 'bg-q3', 'bg-q4'] as const

interface AnswerEditorProps {
  index: 0 | 1 | 2 | 3
  letter: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onMarkCorrect: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  textInputProps: UseFormRegisterReturn
  error?: string
}

export function AnswerEditor({
  index,
  letter,
  isCorrect,
  canMoveUp,
  canMoveDown,
  onMarkCorrect,
  onMoveUp,
  onMoveDown,
  textInputProps,
  error,
}: AnswerEditorProps) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] font-display text-[15px] font-bold text-white ${ANSWER_BG[index]}`}
          aria-hidden="true"
        >
          {letter}
        </div>
        <input
          type="text"
          placeholder={`Answer ${letter}`}
          className="flex-1 rounded-[10px] border border-ink-border bg-surface px-3.5 py-2 text-[14px] text-ink placeholder:text-ink-muted focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          {...textInputProps}
        />

        {/* Reorder: up/down stacked */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Move answer up"
            title="Move up"
            className="flex h-4 w-6 items-center justify-center rounded text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink-soft disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 15l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Move answer down"
            title="Move down"
            className="flex h-4 w-6 items-center justify-center rounded text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink-soft disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={onMarkCorrect}
          aria-pressed={isCorrect}
          aria-label={isCorrect ? 'Marked correct' : 'Mark as correct'}
          title={isCorrect ? 'Marked correct' : 'Mark as correct'}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isCorrect
              ? 'border-correct bg-correct-soft text-correct'
              : 'border-ink-border text-transparent hover:border-correct/50'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {error && <p className="mt-1 ml-[46px] text-xs text-wrong">{error}</p>}
    </div>
  )
}
