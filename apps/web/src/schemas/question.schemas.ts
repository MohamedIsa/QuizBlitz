import { z } from 'zod'

export const TIME_LIMITS = [10, 20, 30, 60, 90] as const
export type TimeLimit = (typeof TIME_LIMITS)[number]

const answerSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Required')
    .max(200, 'Must be 200 characters or less'),
})

export const questionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Question text is required')
    .max(500, 'Must be 500 characters or less'),
  timeLimit: z.union([
    z.literal(10),
    z.literal(20),
    z.literal(30),
    z.literal(60),
    z.literal(90),
  ]),
  answers: z.array(answerSchema).length(4, 'Must have 4 answers'),
  correctIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
})

export type QuestionFormInput = z.infer<typeof questionSchema>
