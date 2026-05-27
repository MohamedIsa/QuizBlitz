import { z } from 'zod'

// ─── Quiz schemas ─────────────────────────────────────────────────────────

export const createQuizSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be fewer than 100 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(500, 'Description must be fewer than 500 characters')
    .transform((v) => v.trim())
    .optional()
    .default(''),
  coverImageUrl: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional().default(false),
})

export const updateQuizSchema = createQuizSchema.partial()

// ─── Inferred types ───────────────────────────────────────────────────────

export type CreateQuizInput = z.infer<typeof createQuizSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>

// ─── API response types ──────────────────────────────────────────────────

export type QuizStatus = 'draft' | 'published'

export interface Quiz {
  id: string
  title: string
  description: string | null
  coverImageUrl: string | null
  status: QuizStatus
  questionCount: number
  createdAt: string
  updatedAt: string
}
