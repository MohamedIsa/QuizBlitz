import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useCreateQuiz,
  useDeleteQuiz,
  useQuiz,
  useUpdateQuiz,
} from '@/hooks/useQuizzes'
import {
  useCreateQuestion,
  useDeleteQuestion,
  useQuestions,
  useUpdateQuestion,
} from '@/hooks/useQuestions'
import { QuizEditorForm } from '@/components/quiz/QuizEditorForm'
import { QuestionEditorForm } from '@/components/quiz/QuestionEditorForm'
import { QuestionList } from '@/components/quiz/QuestionList'
import type { QuizFormInput } from '@/schemas/quiz.schemas'
import type { QuestionFormInput } from '@/schemas/question.schemas'
import type { OptionLabel, QuestionOption } from '@/types/question'

type SelectedQuestion = string | 'new' | null

const OPTION_LABELS: OptionLabel[] = ['A', 'B', 'C', 'D']

export function QuizEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isCreate = !id

  const { data: quiz, isLoading: quizLoading, isError: quizError } = useQuiz(id)
  const { data: questions = [], isLoading: questionsLoading } = useQuestions(id)

  const createQuiz = useCreateQuiz()
  const updateQuiz = useUpdateQuiz()
  const deleteQuiz = useDeleteQuiz()
  const createQuestion = useCreateQuestion()
  const updateQuestion = useUpdateQuestion()
  const deleteQuestion = useDeleteQuestion()

  const [selectedQuestionId, setSelectedQuestionId] = useState<SelectedQuestion>(null)
  const [quizSubmitError, setQuizSubmitError] = useState<string | null>(null)
  const [questionSubmitError, setQuestionSubmitError] = useState<string | null>(null)

  const isQuizSubmitting =
    createQuiz.isPending || updateQuiz.isPending || deleteQuiz.isPending
  const isQuestionSubmitting =
    createQuestion.isPending || updateQuestion.isPending || deleteQuestion.isPending

  // ─── Quiz handlers ─────────────────────────────────────────────────────────
  const handleSaveQuiz = (data: QuizFormInput) => {
    setQuizSubmitError(null)
    const description = data.description?.trim() ? data.description.trim() : undefined
    const coverImageUrl = data.coverImageUrl ?? null

    if (isCreate) {
      createQuiz.mutate(
        { title: data.title, description, status: data.status },
        {
          onSuccess: async created => {
            // Backend's CreateQuizDto does not accept coverImageUrl —
            // if the user picked an image during create, persist it via update.
            if (coverImageUrl) {
              try {
                await updateQuiz.mutateAsync({
                  id: created.id,
                  dto: { coverImageUrl },
                })
              } catch {
                // Non-blocking — they can re-upload after navigation.
              }
            }
            navigate(`/quizzes/${created.id}/edit`, { replace: true })
          },
          onError: (err: Error) => setQuizSubmitError(err.message),
        },
      )
    } else {
      updateQuiz.mutate(
        {
          id: id!,
          dto: {
            title: data.title,
            description,
            status: data.status,
            coverImageUrl,
          },
        },
        {
          onError: (err: Error) => setQuizSubmitError(err.message),
        },
      )
    }
  }

  const handleDeleteQuiz = () => {
    if (!id) return
    const confirmed = window.confirm(
      'Delete this quiz? This action cannot be undone.',
    )
    if (!confirmed) return
    setQuizSubmitError(null)
    deleteQuiz.mutate(id, {
      onSuccess: () => navigate('/quizzes'),
      onError: (err: Error) => setQuizSubmitError(err.message),
    })
  }

  // ─── Question handlers ────────────────────────────────────────────────────
  const handleAddQuestion = () => {
    setQuestionSubmitError(null)
    setSelectedQuestionId('new')
  }

  const handleSelectQuestion = (qid: string) => {
    setQuestionSubmitError(null)
    setSelectedQuestionId(qid)
  }

  const handleSaveQuestion = (data: QuestionFormInput) => {
    if (!id) return
    setQuestionSubmitError(null)

    const options: QuestionOption[] = data.answers.map((a, i) => ({
      label: OPTION_LABELS[i],
      text: a.text.trim(),
    }))
    const dto = {
      text: data.text,
      options,
      correctOptionIndex: data.correctIndex,
      timeLimit: data.timeLimit,
    }

    if (selectedQuestionId === 'new') {
      createQuestion.mutate(
        { quizId: id, dto },
        {
          onSuccess: created => setSelectedQuestionId(created.id),
          onError: (err: Error) => setQuestionSubmitError(err.message),
        },
      )
    } else if (selectedQuestionId) {
      updateQuestion.mutate(
        { quizId: id, id: selectedQuestionId, dto },
        {
          onError: (err: Error) => setQuestionSubmitError(err.message),
        },
      )
    }
  }

  const handleDeleteQuestion = () => {
    if (!id || !selectedQuestionId || selectedQuestionId === 'new') return
    const confirmed = window.confirm('Delete this question?')
    if (!confirmed) return
    setQuestionSubmitError(null)
    deleteQuestion.mutate(
      { quizId: id, id: selectedQuestionId },
      {
        onSuccess: () => setSelectedQuestionId(null),
        onError: (err: Error) => setQuestionSubmitError(err.message),
      },
    )
  }

  // ─── Loading / error states (edit mode only) ──────────────────────────────
  if (!isCreate && quizLoading) {
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

  if (!isCreate && (quizError || !quiz)) {
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
  const selectedQuestion =
    selectedQuestionId && selectedQuestionId !== 'new'
      ? questions.find(q => q.id === selectedQuestionId)
      : undefined

  return (
    <div className="flex h-full flex-col">
      <EditorHeader title={headerTitle} status={quiz?.status} />

      <div className="flex min-h-0 flex-1">
        <QuestionList
          questions={questions}
          selectedId={selectedQuestionId}
          isLoading={!isCreate && questionsLoading}
          canAdd={!isCreate}
          onSelect={handleSelectQuestion}
          onAddNew={handleAddQuestion}
        />

        <div className="flex-1 overflow-auto bg-surface-2 p-7">
          <div className="mx-auto max-w-3xl space-y-5">
            {/* Quiz details */}
            <section className="rounded-2xl border border-ink-border bg-surface p-6 shadow-card">
              <h2 className="mb-4 font-display text-[16px] font-bold tracking-[-0.2px] text-ink">
                Quiz details
              </h2>
              <QuizEditorForm
                quiz={quiz}
                isSubmitting={isQuizSubmitting}
                submitError={quizSubmitError}
                onSubmit={handleSaveQuiz}
                onDelete={isCreate ? undefined : handleDeleteQuiz}
              />
            </section>

            {/* Question editor */}
            {!isCreate && selectedQuestionId !== null && (
              <section className="rounded-2xl border border-ink-border bg-surface p-6 shadow-card">
                <h2 className="mb-4 font-display text-[16px] font-bold tracking-[-0.2px] text-ink">
                  {selectedQuestionId === 'new' ? 'New question' : 'Edit question'}
                </h2>
                <QuestionEditorForm
                  key={selectedQuestionId}
                  question={selectedQuestion}
                  isSubmitting={isQuestionSubmitting}
                  submitError={questionSubmitError}
                  onSubmit={handleSaveQuestion}
                  onDelete={selectedQuestion ? handleDeleteQuestion : undefined}
                />
              </section>
            )}

            {/* Empty state for question editor */}
            {!isCreate && selectedQuestionId === null && (
              <div className="rounded-2xl border-2 border-dashed border-ink-border bg-surface p-12 text-center">
                {questions.length === 0 ? (
                  <>
                    <p className="text-[14px] font-semibold text-ink">No questions yet</p>
                    <p className="mt-1 text-[12px] text-ink-muted">
                      Click "Add question" in the sidebar to create your first question.
                    </p>
                  </>
                ) : (
                  <p className="text-[13px] text-ink-muted">
                    Select a question on the left to edit it, or click "Add question" to create a new one.
                  </p>
                )}
              </div>
            )}
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
