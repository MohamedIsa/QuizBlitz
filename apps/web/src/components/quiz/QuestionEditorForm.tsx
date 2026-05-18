import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  TIME_LIMITS,
  questionSchema,
  type QuestionFormInput,
  type TimeLimit,
} from '@/schemas/question.schemas'
import type { Question } from '@/types/question'
import { AnswerEditor } from './AnswerEditor'

interface QuestionEditorFormProps {
  question?: Question
  isSubmitting: boolean
  submitError?: string | null
  onSubmit: (data: QuestionFormInput) => void
  onDelete?: () => void
}

const LETTERS = ['A', 'B', 'C', 'D'] as const
type CorrectIndex = 0 | 1 | 2 | 3

function defaultValuesFor(question?: Question): QuestionFormInput {
  if (!question) {
    return {
      text: '',
      timeLimit: 30,
      answers: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
      correctIndex: 0,
    }
  }
  const answers = Array.from({ length: 4 }, (_, i) => ({
    text: question.options[i]?.text ?? '',
  }))
  const ci = question.correctOptionIndex
  const correctIndex: CorrectIndex = ci === 1 || ci === 2 || ci === 3 ? ci : 0
  const timeLimit: TimeLimit = (TIME_LIMITS as readonly number[]).includes(question.timeLimit)
    ? (question.timeLimit as TimeLimit)
    : 30
  return {
    text: question.text,
    timeLimit,
    answers,
    correctIndex,
  }
}

export function QuestionEditorForm({
  question,
  isSubmitting,
  submitError,
  onSubmit,
  onDelete,
}: QuestionEditorFormProps) {
  const isEdit = !!question

  const form = useForm<QuestionFormInput>({
    resolver: zodResolver(questionSchema) as unknown as Resolver<QuestionFormInput>,
    defaultValues: defaultValuesFor(question),
  })

  const timeLimit = form.watch('timeLimit')
  const correctIndex = form.watch('correctIndex')

  const swapAnswers = (a: CorrectIndex, b: CorrectIndex) => {
    const aText = form.getValues(`answers.${a}.text`)
    const bText = form.getValues(`answers.${b}.text`)
    form.setValue(`answers.${a}.text`, bText, { shouldDirty: true })
    form.setValue(`answers.${b}.text`, aText, { shouldDirty: true })

    const ci = form.getValues('correctIndex')
    if (ci === a) form.setValue('correctIndex', b, { shouldDirty: true })
    else if (ci === b) form.setValue('correctIndex', a, { shouldDirty: true })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Question text */}
      <div>
        <label htmlFor="question-text" className="mb-1.5 block text-xs font-semibold text-ink-soft">
          Question
        </label>
        <textarea
          id="question-text"
          rows={2}
          placeholder="e.g. What is the capital of France?"
          className="w-full resize-none rounded-[10px] border border-ink-border bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          {...form.register('text')}
        />
        {form.formState.errors.text && (
          <p className="mt-1 text-xs text-wrong">{form.formState.errors.text.message}</p>
        )}
      </div>

      {/* Time limit */}
      <div>
        <span className="mb-1.5 block text-xs font-semibold text-ink-soft">Time limit</span>
        <div className="flex flex-wrap gap-2">
          {TIME_LIMITS.map(tl => {
            const isActive = timeLimit === tl
            return (
              <button
                key={tl}
                type="button"
                onClick={() => form.setValue('timeLimit', tl, { shouldDirty: true })}
                aria-pressed={isActive}
                className={`rounded-[10px] border-2 px-4 py-2 font-display text-[13px] font-bold transition-colors ${
                  isActive
                    ? 'border-violet bg-violet-tint text-violet'
                    : 'border-ink-border bg-surface text-ink-soft hover:bg-surface-2'
                }`}
              >
                {tl}s
              </button>
            )
          })}
        </div>
      </div>

      {/* Answers */}
      <div>
        <span className="mb-2 block text-xs font-semibold text-ink-soft">
          Answers{' '}
          <span className="font-normal text-ink-muted">(mark one as correct)</span>
        </span>
        <div className="flex flex-col gap-3">
          {LETTERS.map((letter, i) => {
            const idx = i as CorrectIndex
            return (
              <AnswerEditor
                key={letter}
                index={idx}
                letter={letter}
                isCorrect={correctIndex === idx}
                canMoveUp={idx > 0}
                canMoveDown={idx < 3}
                onMarkCorrect={() =>
                  form.setValue('correctIndex', idx, { shouldDirty: true })
                }
                onMoveUp={() => swapAnswers(idx, (idx - 1) as CorrectIndex)}
                onMoveDown={() => swapAnswers(idx, (idx + 1) as CorrectIndex)}
                textInputProps={form.register(`answers.${i}.text`)}
                error={form.formState.errors.answers?.[i]?.text?.message}
              />
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
      <div className="flex items-center gap-2">
        {isEdit && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isSubmitting}
            className="rounded-[10px] border border-wrong/30 px-4 py-2.5 text-[13px] font-semibold text-wrong transition-colors hover:bg-wrong-soft disabled:opacity-50"
          >
            Delete question
          </button>
        )}
        <div className="flex-1" />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[10px] bg-violet px-5 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save question' : 'Add question'}
        </button>
      </div>
    </form>
  )
}
