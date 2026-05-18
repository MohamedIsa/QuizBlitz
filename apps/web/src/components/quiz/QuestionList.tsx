import type { Question } from '@/types/question'

interface QuestionListProps {
  questions: Question[]
  selectedId: string | 'new' | null
  isLoading: boolean
  canAdd: boolean
  onSelect: (id: string) => void
  onAddNew: () => void
}

export function QuestionList({
  questions,
  selectedId,
  isLoading,
  canAdd,
  onSelect,
  onAddNew,
}: QuestionListProps) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-ink-border bg-surface">
      <div className="border-b border-border-soft px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[1px] text-ink-muted">
          Questions ({questions.length})
        </p>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {isLoading && (
          <div className="space-y-1.5 p-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-12 animate-pulse rounded-[10px] bg-surface-3" />
            ))}
          </div>
        )}

        {!isLoading && questions.length === 0 && (
          <div className="px-2 py-6 text-center text-[12px] text-ink-muted">
            {canAdd
              ? 'No questions yet.'
              : 'Save the quiz first to add questions.'}
          </div>
        )}

        {!isLoading && questions.length > 0 && (
          <ul className="space-y-1">
            {questions.map((q, i) => {
              const isActive = selectedId === q.id
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(q.id)}
                    className={`flex w-full items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'border-violet bg-violet-tint'
                        : 'border-transparent bg-surface-2 hover:bg-surface-3'
                    }`}
                  >
                    <span className="mt-px w-5 shrink-0 font-mono text-[11px] text-ink-muted">
                      {i + 1}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={`truncate text-[12.5px] font-medium ${
                          isActive ? 'text-violet' : 'text-ink'
                        }`}
                      >
                        {q.text || 'Untitled question'}
                      </span>
                      <span className="mt-0.5 text-[10.5px] text-ink-muted">
                        {q.options?.length ?? 0} answers
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border-soft p-3">
        <button
          type="button"
          onClick={onAddNew}
          disabled={!canAdd}
          className={`flex w-full items-center justify-center gap-1.5 rounded-[10px] border-2 border-dashed px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
            !canAdd
              ? 'cursor-not-allowed border-ink-border text-ink-muted opacity-50'
              : selectedId === 'new'
              ? 'border-violet bg-violet-tint text-violet'
              : 'border-ink-border text-ink-soft hover:bg-surface-2'
          }`}
        >
          <span className="text-base leading-none">+</span>
          Add question
        </button>
      </div>
    </aside>
  )
}
