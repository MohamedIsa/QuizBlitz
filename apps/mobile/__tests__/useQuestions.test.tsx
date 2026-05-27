import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuestions, useCreateQuestion, useReorderQuestions } from '@/hooks/useQuestions'
import { questionApi } from '@/lib/question.api'
import type { Question } from '@/validation/question'

jest.mock('@/lib/question.api')

const QUIZ_ID = 'quiz-1'

const mockQuestion: Question = {
  id: 'q1',
  text: 'What is 2+2?',
  options: [
    { id: 'o1', text: 'Three' },
    { id: 'o2', text: 'Four' },
  ],
  correctOptionIndex: 1,
  timeLimit: 30,
  imageUrl: null,
  orderIndex: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { Wrapper, queryClient }
}

describe('useQuestions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches questions for a quiz', async () => {
    ;(questionApi.getAll as jest.Mock).mockResolvedValue([mockQuestion])

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useQuestions(QUIZ_ID), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(questionApi.getAll).toHaveBeenCalledWith(QUIZ_ID)
    expect(result.current.data).toEqual([mockQuestion])
  })
})

describe('useCreateQuestion', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls questionApi.create and invalidates cache', async () => {
    ;(questionApi.create as jest.Mock).mockResolvedValue(mockQuestion)

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateQuestion(QUIZ_ID), { wrapper: Wrapper })

    const dto = {
      text: 'What is 2+2?',
      options: [{ text: 'Three' }, { text: 'Four' }],
      correctOptionIndex: 1,
      timeLimit: 30,
    }

    await act(async () => {
      result.current.mutate(dto)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(questionApi.create).toHaveBeenCalledWith(QUIZ_ID, dto)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['questions', QUIZ_ID] })
  })
})

describe('useReorderQuestions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls questionApi.reorder and invalidates cache', async () => {
    ;(questionApi.reorder as jest.Mock).mockResolvedValue(undefined)

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useReorderQuestions(QUIZ_ID), { wrapper: Wrapper })

    const items = [
      { id: 'q1', orderIndex: 1 },
      { id: 'q2', orderIndex: 0 },
    ]

    await act(async () => {
      result.current.mutate(items)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(questionApi.reorder).toHaveBeenCalledWith(QUIZ_ID, items)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['questions', QUIZ_ID] })
  })
})
