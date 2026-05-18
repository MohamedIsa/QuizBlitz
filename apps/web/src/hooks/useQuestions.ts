import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { questionApi } from '@/lib/question.api'
import type { CreateQuestionDto, UpdateQuestionDto } from '@/types/question'

export const QUESTION_KEYS = {
  byQuiz: (quizId: string) => ['questions', 'quiz', quizId] as const,
}

export function useQuestions(quizId: string | undefined) {
  return useQuery({
    queryKey: QUESTION_KEYS.byQuiz(quizId ?? ''),
    queryFn: () => questionApi.listByQuiz(quizId!),
    enabled: !!quizId,
  })
}

export function useCreateQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, dto }: { quizId: string; dto: CreateQuestionDto }) =>
      questionApi.create(quizId, dto),
    onSuccess: (_data, { quizId }) => {
      qc.invalidateQueries({ queryKey: QUESTION_KEYS.byQuiz(quizId) })
    },
  })
}

export function useUpdateQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      quizId,
      id,
      dto,
    }: {
      quizId: string
      id: string
      dto: UpdateQuestionDto
    }) => questionApi.update(quizId, id, dto),
    onSuccess: (_data, { quizId }) => {
      qc.invalidateQueries({ queryKey: QUESTION_KEYS.byQuiz(quizId) })
    },
  })
}

export function useDeleteQuestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, id }: { quizId: string; id: string }) =>
      questionApi.remove(quizId, id),
    onSuccess: (_data, { quizId }) => {
      qc.invalidateQueries({ queryKey: QUESTION_KEYS.byQuiz(quizId) })
    },
  })
}
