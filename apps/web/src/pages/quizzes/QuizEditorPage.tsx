import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateQuiz, useDeleteQuiz, useQuiz, useUpdateQuiz } from '@/hooks/useQuizzes'
import { QuizEditorForm } from '@/components/quiz/QuizEditorForm'
import type { QuizFormInput } from '@/schemas/quiz.schemas'

export function QuizEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isCreate = !id

  const { data: quiz, isLoading, isError } = useQuiz(id)
  const createMutation = useCreateQuiz()
  const updateMutation = useUpdateQuiz()
  const deleteMutation = useDeleteQuiz()

  const [submitError, setSubmitError] = useState<string | null>(null)

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const handleSubmit = (data: QuizFormInput) => {
    setSubmitError(null)
    const description = data.description?.trim() ? data.description.trim() : undefined

    if (isCreate) {
      createMutation.mutate(
        { title: data.title, description, status: data.status },
        {
          onSuccess: created => {
            navigate(`/quizzes/${created.id}/edit`, { replace: true })
          },
          onError: (err: Error) => setSubmitError(err.message),
        },
      )
    } else {
      updateMutation.mutate(
        {
          id: id!,
          dto: { title: data.title, description, status: data.status },
        },
        {
          onError: (err: Error) => setSubmitError(err.message),
        },
      )
    }
  }

  const handleDelete = () => {
    if (!id) return
    const confirmed = window.confirm(
      'Delete this quiz? This action cannot be undone.',
    )
    if (!confirmed) return
    setSubmitError(null)
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/quizzes'),
      onError: (err: Error) => setSubmitError(err.message),
    })
  }

  // Loading / error states (edit mode only — create mode renders immediately)
  if (!isCreate && isLoading) {
    return (
      <div className="flex h-full flex-col">
        <EditorHeader title="Loading…" />
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-2xl animate-pulse space-y-4">
            <div className="h-10 rounded bg-surface-3" />
            <div className="h-24 rounded bg-surface-3" />
            <div className="h-10 w-1/2 rounded bg-surface-3" />
          </div>
        </div>
      </div>
    )
  }

  if (!isCreate && (isError || !quiz)) {
    return (
      <div className="flex h-full flex-col">
        <EditorHeader title="Quiz not found" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-wrong">We couldn't load this quiz.</p>
          <button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="mt-3 rounded-[10px] border border-ink-border px-4 py-2 text-[13px] font-semibold text-ink-soft hover:bg-surface-2"
          >
            Back to library
          </button>
        </div>
      </div>
    )
  }

  const headerTitle = isCreate ? 'New quiz' : quiz?.title ?? 'Quiz'
  const questionCount = 0 // QB-034 will replace this with real data

  return (
    <div className="flex h-full flex-col">
      <EditorHeader title={headerTitle} status={quiz?.status} />

      <div className="flex flex-1 min-h-0">
        {/* Left: question list placeholder */}
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-ink-border bg-surface p-[18px]">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[1px] text-ink-muted">
            Questions ({questionCount})
          </p>
          <div className="rounded-[10px] border border-dashed border-ink-border bg-surface-2 px-3 py-6 text-center">
            <p className="text-[12.5px] font-semibold text-ink-soft">No questions yet</p>
            <p className="mt-1 text-[11px] text-ink-muted">
              The question editor lands in QB-034.
            </p>
          </div>
        </aside>

        {/* Right: form */}
        <div className="flex-1 overflow-auto bg-surface-2 p-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-ink-border bg-surface p-7 shadow-card">
            <h2 className="mb-5 font-display text-[18px] font-bold tracking-[-0.3px] text-ink">
              Quiz details
            </h2>
            <QuizEditorForm
              quiz={quiz}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onSubmit={handleSubmit}
              onDelete={isCreate ? undefined : handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function EditorHeader({ title, status }: { title: string; status?: 'draft' | 'published' }) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3.5 border-b border-ink-border bg-surface px-6 py-3.5">
      <button
        type="button"
        onClick={() => navigate('/quizzes')}
        className="text-[12px] text-ink-muted hover:text-ink-soft"
      >
        ← Quizzes
      </button>
      <div className="h-4 w-px bg-ink-border" />
      <h1 className="flex-1 truncate font-display text-[17px] font-bold text-ink">
        {title}
      </h1>
      {status && (
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            status === 'published'
              ? 'bg-correct-soft text-correct'
              : 'bg-surface-3 text-ink-muted'
          }`}
        >
          {status === 'published' ? 'Published' : 'Draft'}
        </span>
      )}
    </header>
  )
}
