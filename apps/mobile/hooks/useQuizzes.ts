import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizApi } from '@/lib/quiz.api'
import type { CreateQuizInput, UpdateQuizInput } from '@/validation/quiz'

const QUIZZES_KEY = ['quizzes'] as const

export function useQuizzes() {
  return useQuery({
    queryKey: QUIZZES_KEY,
    queryFn: quizApi.getAll,
  })
}

export function useQuiz(id: string) {
  return useQuery({
    queryKey: [...QUIZZES_KEY, id],
    queryFn: () => quizApi.getOne(id),
    enabled: !!id,
  })
}

export function useCreateQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateQuizInput) => quizApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUIZZES_KEY }),
  })
}

export function useUpdateQuiz(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateQuizInput) => quizApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUIZZES_KEY, id] })
      qc.invalidateQueries({ queryKey: QUIZZES_KEY })
    },
  })
}

export function useDeleteQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quizApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUIZZES_KEY }),
  })
}
