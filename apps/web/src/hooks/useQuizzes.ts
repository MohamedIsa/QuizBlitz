import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '@/lib/quiz.api'
import type { CreateQuizDto, UpdateQuizDto } from '@/types/quiz'

export const QUIZ_KEYS = {
  all: ['quizzes'] as const,
  one: (id: string) => ['quizzes', id] as const,
}

export function useQuizzes() {
  return useQuery({
    queryKey: QUIZ_KEYS.all,
    queryFn: quizApi.getAll,
  })
}

export function useQuiz(id: string | undefined) {
  return useQuery({
    queryKey: QUIZ_KEYS.one(id ?? ''),
    queryFn: () => quizApi.getOne(id!),
    enabled: !!id,
  })
}

export function useCreateQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateQuizDto) => quizApi.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.all }),
  })
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateQuizDto }) => quizApi.update(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.all })
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.one(id) })
    },
  })
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quizApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.all }),
  })
}
