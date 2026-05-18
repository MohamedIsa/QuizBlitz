import { z } from 'zod'

export const quizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(150, 'Title must be 150 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  status: z.enum(['draft', 'published']),
})

export type QuizFormInput = z.infer<typeof quizSchema>
