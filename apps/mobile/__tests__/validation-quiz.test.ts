import { createQuizSchema } from '@/validation/quiz'

const validQuiz = {
  title: 'My Quiz',
  description: 'A test quiz',
  coverImageUrl: null,
  isPublished: false,
}

describe('createQuizSchema', () => {
  it('accepts valid input', () => {
    const result = createQuizSchema.safeParse(validQuiz)
    expect(result.success).toBe(true)
  })

  it('trims whitespace from title', () => {
    const result = createQuizSchema.safeParse({ ...validQuiz, title: '  Spaced Title  ' })
    expect(result.success && result.data.title).toBe('Spaced Title')
  })

  it('defaults isPublished to false when omitted', () => {
    const { isPublished: _, ...withoutPublished } = validQuiz
    const result = createQuizSchema.safeParse(withoutPublished)
    expect(result.success && result.data.isPublished).toBe(false)
  })

  it('defaults description to empty string when omitted', () => {
    const { description: _, ...withoutDesc } = validQuiz
    const result = createQuizSchema.safeParse(withoutDesc)
    expect(result.success && result.data.description).toBe('')
  })

  it('rejects missing title', () => {
    const result = createQuizSchema.safeParse({ ...validQuiz, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects title over 100 characters', () => {
    const result = createQuizSchema.safeParse({ ...validQuiz, title: 'x'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects description over 500 characters', () => {
    const result = createQuizSchema.safeParse({ ...validQuiz, description: 'x'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('accepts null coverImageUrl', () => {
    const result = createQuizSchema.safeParse({ ...validQuiz, coverImageUrl: null })
    expect(result.success).toBe(true)
  })

  it('rejects non-URL coverImageUrl', () => {
    const result = createQuizSchema.safeParse({ ...validQuiz, coverImageUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })
})
