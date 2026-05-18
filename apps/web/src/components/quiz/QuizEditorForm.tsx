import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { quizSchema, type QuizFormInput } from '@/schemas/quiz.schemas'
import type { Quiz, QuizStatus } from '@/types/quiz'
import { CoverImageUploader } from './CoverImageUploader'

interface QuizEditorFormProps {
  quiz?: Quiz
  isSubmitting: boolean
  submitError?: string | null
  onSubmit: (data: QuizFormInput) => void
  onDelete?: () => void
}

const STATUS_OPTIONS: { value: QuizStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Only you can see it' },
  { value: 'published', label: 'Published', description: 'Ready to host a session' },
]

export function QuizEditorForm({ quiz, isSubmitting, submitError, onSubmit, onDelete }: QuizEditorFormProps) {
  const isEdit = !!quiz

  const form = useForm<QuizFormInput>({
    resolver: zodResolver(quizSchema) as unknown as Resolver<QuizFormInput>,
    defaultValues: {
      title: quiz?.title ?? '',
      description: quiz?.description ?? '',
      status: quiz?.status ?? 'draft',
      coverImageUrl: quiz?.coverImageUrl ?? null,
    },
  })

  const status = form.watch('status')
  const coverImageUrl = form.watch('coverImageUrl') ?? null

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-xs font-semibold text-ink-soft">
          Title
        </label>
        <input
          id="title"
          type="text"
          autoComplete="off"
          placeholder="e.g. World Capitals"
          className="w-full rounded-[10px] border border-ink-border bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          {...form.register('title')}
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-xs text-wrong">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1.5 block text-xs font-semibold text-ink-soft">
          Description <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="A short description players will see in the lobby."
          className="w-full resize-none rounded-[10px] border border-ink-border bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="mt-1 text-xs text-wrong">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Cover image */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
          Cover image <span className="font-normal text-ink-muted">(optional)</span>
        </span>
        <CoverImageUploader
          imageUrl={coverImageUrl}
          onChange={url => form.setValue('coverImageUrl', url, { shouldDirty: true })}
        />
      </div>

      {/* Status */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold text-ink-soft">Status</span>
        <div className="grid grid-cols-2 gap-2.5">
          {STATUS_OPTIONS.map(opt => {
            const isActive = status === opt.value
            const activeStyle =
              opt.value === 'published'
                ? 'border-correct bg-correct-soft text-correct'
                : 'border-violet bg-violet-tint text-violet'
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => form.setValue('status', opt.value, { shouldDirty: true })}
                className={`flex flex-col items-start gap-0.5 rounded-[10px] border-2 px-3.5 py-2.5 text-left transition-colors ${
                  isActive
                    ? activeStyle
                    : 'border-ink-border bg-surface text-ink-soft hover:bg-surface-2'
                }`}
                aria-pressed={isActive}
              >
                <span className="text-[13.5px] font-semibold">{opt.label}</span>
                <span className={`text-[11.5px] ${isActive ? 'opacity-80' : 'text-ink-muted'}`}>
                  {opt.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Submission error */}
      {submitError && (
        <p className="rounded-[10px] bg-wrong-soft px-4 py-2.5 text-sm text-wrong" role="alert">
          {submitError}
        </p>
      )}

      {/* Footer actions */}
      <div className="mt-2 flex items-center gap-2">
        {isEdit && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="rounded-[10px] border border-wrong/30 px-4 py-2.5 text-[13px] font-semibold text-wrong transition-colors hover:bg-wrong-soft disabled:opacity-50"
          >
            Delete
          </button>
        )}
        <div className="flex-1" />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[10px] bg-violet px-5 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create quiz'}
        </button>
      </div>
    </form>
  )
}
