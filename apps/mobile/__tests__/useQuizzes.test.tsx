import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuizzes, useCreateQuiz, useDeleteQuiz } from '@/hooks/useQuizzes'
import { quizApi } from '@/lib/quiz.api'
import type { Quiz } from '@/validation/quiz'

jest.mock('@/lib/quiz.api')

const mockQuiz: Quiz = {
  id: '1',
  title: 'Test Quiz',
  description: null,
  coverImageUrl: null,
  status: 'draft',
  questionCount: 0,
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

describe('useQuizzes', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches quizzes from quizApi.getAll', async () => {
    ;(quizApi.getAll as jest.Mock).mockResolvedValue([mockQuiz])

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useQuizzes(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(quizApi.getAll).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual([mockQuiz])
  })
})

describe('useCreateQuiz', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls quizApi.create and invalidates quizzes cache', async () => {
    ;(quizApi.create as jest.Mock).mockResolvedValue(mockQuiz)

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateQuiz(), { wrapper: Wrapper })

    await act(async () => {
      result.current.mutate({ title: 'Test Quiz' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(quizApi.create).toHaveBeenCalledWith({ title: 'Test Quiz' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['quizzes'] })
  })
})

describe('useDeleteQuiz', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls quizApi.remove and invalidates quizzes cache', async () => {
    ;(quizApi.remove as jest.Mock).mockResolvedValue(undefined)

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteQuiz(), { wrapper: Wrapper })

    await act(async () => {
      result.current.mutate('1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(quizApi.remove).toHaveBeenCalledWith('1')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['quizzes'] })
  })
})
