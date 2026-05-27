import { z } from 'zod'

// ─── Constants ────────────────────────────────────────────────────────────

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 4
export const TIME_LIMIT_OPTIONS = [10, 20, 30, 60, 90] as const

// ─── Option schema ────────────────────────────────────────────────────────

const optionSchema = z.object({
  text: z
    .string()
    .min(1, 'Option text is required')
    .max(200, 'Option must be fewer than 200 characters')
    .transform((v) => v.trim()),
})

// ─── Question schemas ─────────────────────────────────────────────────────

export const createQuestionSchema = z
  .object({
    text: z
      .string()
      .min(1, 'Question text is required')
      .max(500, 'Question must be fewer than 500 characters')
      .transform((v) => v.trim()),
    options: z
      .array(optionSchema)
      .min(MIN_OPTIONS, `At least ${MIN_OPTIONS} options are required`)
      .max(MAX_OPTIONS, `At most ${MAX_OPTIONS} options are allowed`),
    correctOptionIndex: z.number().int().min(0),
    timeLimit: z.number().refine(
      (v) => (TIME_LIMIT_OPTIONS as readonly number[]).includes(v),
      'Invalid time limit',
    ),
    imageUrl: z.string().url().nullable().optional(),
  })
  .refine(
    (data) => data.correctOptionIndex < data.options.length,
    { message: 'Please select a valid correct answer', path: ['correctOptionIndex'] },
  )

export const updateQuestionSchema = createQuestionSchema

// ─── Inferred types ───────────────────────────────────────────────────────

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>

// ─── API response types ──────────────────────────────────────────────────

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  options: QuestionOption[]
  correctOptionIndex: number
  timeLimit: number
  imageUrl: string | null
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface ReorderItem {
  id: string
  orderIndex: number
}
