import { apiClient } from '@/lib/api-client'
import type { Envelope } from '@/lib/api-client'
import type { CreateQuestionDto, Question, UpdateQuestionDto } from '@/types/question'

export const questionApi = {
  listByQuiz: (quizId: string): Promise<Question[]> =>
    apiClient
      .get<Envelope<Question[]>>(`/quizzes/${quizId}/questions`)
      .then(r => r.data.data),

  create: (quizId: string, dto: CreateQuestionDto): Promise<Question> =>
    apiClient
      .post<Envelope<Question>>(`/quizzes/${quizId}/questions`, dto)
      .then(r => r.data.data),

  update: (quizId: string, id: string, dto: UpdateQuestionDto): Promise<Question> =>
    apiClient
      .patch<Envelope<Question>>(`/quizzes/${quizId}/questions/${id}`, dto)
      .then(r => r.data.data),

  remove: (quizId: string, id: string): Promise<void> =>
    apiClient.delete(`/quizzes/${quizId}/questions/${id}`).then(() => undefined),
}
