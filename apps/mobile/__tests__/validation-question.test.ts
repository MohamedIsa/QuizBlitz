import { createQuestionSchema } from '@/validation/question'

const validQuestion = {
  text: 'What is 2 + 2?',
  options: [{ text: 'Three' }, { text: 'Four' }],
  correctOptionIndex: 1,
  timeLimit: 30,
  imageUrl: null,
}

describe('createQuestionSchema', () => {
  it('accepts valid input', () => {
    const result = createQuestionSchema.safeParse(validQuestion)
    expect(result.success).toBe(true)
  })

  it('rejects empty question text', () => {
    const result = createQuestionSchema.safeParse({ ...validQuestion, text: '' })
    expect(result.success).toBe(false)
  })

  it('rejects fewer than 2 options', () => {
    const result = createQuestionSchema.safeParse({
      ...validQuestion,
      options: [{ text: 'Only one' }],
      correctOptionIndex: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 4 options', () => {
    const result = createQuestionSchema.safeParse({
      ...validQuestion,
      options: Array.from({ length: 5 }, (_, i) => ({ text: `Option ${i}` })),
    })
    expect(result.success).toBe(false)
  })

  it('rejects correctOptionIndex >= options.length', () => {
    const result = createQuestionSchema.safeParse({
      ...validQuestion,
      correctOptionIndex: 2,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid time limit', () => {
    const result = createQuestionSchema.safeParse({ ...validQuestion, timeLimit: 45 })
    expect(result.success).toBe(false)
  })

  it('accepts all valid time limits', () => {
    for (const limit of [10, 20, 30, 60, 90]) {
      const result = createQuestionSchema.safeParse({ ...validQuestion, timeLimit: limit })
      expect(result.success).toBe(true)
    }
  })

  it('accepts 4 options with valid correctOptionIndex', () => {
    const result = createQuestionSchema.safeParse({
      ...validQuestion,
      options: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }],
      correctOptionIndex: 3,
    })
    expect(result.success).toBe(true)
  })

  it('rejects option with empty text', () => {
    const result = createQuestionSchema.safeParse({
      ...validQuestion,
      options: [{ text: '' }, { text: 'Valid' }],
    })
    expect(result.success).toBe(false)
  })
})
