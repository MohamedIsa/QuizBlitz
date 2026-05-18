import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizzes } from '@/hooks/useQuizzes'
import { QuizCard } from '@/components/quiz/QuizCard'
import type { QuizStatus } from '@/types/quiz'

type Filter = 'all' | QuizStatus

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
]

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-ink-border bg-surface p-[18px]">
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl bg-surface-3" />
        <div className="h-5 w-16 rounded-full bg-surface-3" />
      </div>
      <div className="mt-4 h-5 w-3/4 rounded bg-surface-3" />
      <div className="my-3.5 h-px bg-border-soft" />
      <div className="flex items-center gap-2">
        <div className="h-4 flex-1 rounded bg-surface-3" />
        <div className="h-7 w-14 rounded bg-surface-3" />
      </div>
    </div>
  )
}

export function QuizLibraryPage() {
  const navigate = useNavigate()
  const { data: quizzes, isLoading, isError } = useQuizzes()
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = quizzes ?? []
    if (activeFilter !== 'all') list = list.filter(q => q.status === activeFilter)
    if (search.trim()) {
      const term = search.toLowerCase()
      list = list.filter(q => q.title.toLowerCase().includes(term))
    }
    return list
  }, [quizzes, activeFilter, search])

  const publishedCount = quizzes?.filter(q => q.status === 'published').length ?? 0

  return (
    <div className="flex min-h-full flex-col">
      {/* Page header */}
      <div className="flex items-center gap-4 border-b border-ink-border bg-surface px-8 py-6">
        <div className="flex-1">
          <h1 className="font-display text-[26px] font-bold tracking-[-0.5px] text-ink">
            My quizzes
          </h1>
          {quizzes && (
            <p className="mt-1 text-[13px] text-ink-muted">
              {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} · {publishedCount} published
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate('/quizzes/new')}
          className="flex items-center gap-2 rounded-[10px] bg-violet px-4 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          New quiz
        </button>
      </div>

      {/* Filter + search bar */}
      <div className="flex items-center gap-1 border-b border-border-soft bg-surface px-8 py-3">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveFilter(value)}
            className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${
              activeFilter === value
                ? 'bg-violet-tint text-violet'
                : 'text-ink-soft hover:bg-surface-2'
            }`}
          >
            {label}
          </button>
        ))}

        <div className="flex-1" />

        <div className="flex w-48 items-center gap-2 rounded-[8px] border border-ink-border bg-surface-2 px-3 py-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-muted" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search quizzes"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-7">
        {isLoading && (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-semibold text-wrong">Failed to load quizzes</p>
            <p className="mt-1 text-xs text-ink-muted">Check your connection and try again.</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-tint">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-violet" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-ink">
              {search ? 'No quizzes match your search' : 'No quizzes yet'}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {search ? 'Try a different search term.' : 'Create your first quiz to get started.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
