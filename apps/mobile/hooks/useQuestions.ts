import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionApi } from '@/lib/question.api'
import type { CreateQuestionInput, UpdateQuestionInput, ReorderItem } from '@/validation/question'

function questionsKey(quizId: string) {
  return ['questions', quizId] as const
}

export function useQuestions(quizId: string) {
  return useQuery({
    queryKey: questionsKey(quizId),
    queryFn: () => questionApi.getAll(quizId),
    enabled: !!quizId,
  })
}

export function useQuestion(quizId: string, questionId: string) {
  return useQuery({
    queryKey: [...questionsKey(quizId), questionId],
    queryFn: () => questionApi.getOne(quizId, questionId),
    enabled: !!quizId && !!questionId,
  })
}

export function useCreateQuestion(quizId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateQuestionInput) => questionApi.create(quizId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: questionsKey(quizId) })
      qc.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}

export function useUpdateQuestion(quizId: string, questionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateQuestionInput) => questionApi.update(quizId, questionId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...questionsKey(quizId), questionId] })
      qc.invalidateQueries({ queryKey: questionsKey(quizId) })
    },
  })
}

export function useDeleteQuestion(quizId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (questionId: string) => questionApi.remove(quizId, questionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: questionsKey(quizId) })
      qc.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}

export function useReorderQuestions(quizId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: ReorderItem[]) => questionApi.reorder(quizId, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: questionsKey(quizId) }),
  })
}
