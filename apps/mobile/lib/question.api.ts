import { apiClient } from '@/core/api-client'
import type { Question, ReorderItem, CreateQuestionInput, UpdateQuestionInput } from '@/validation/question'

export const questionApi = {
  getAll(quizId: string): Promise<Question[]> {
    return apiClient.get<Question[]>(`/quizzes/${quizId}/questions`)
  },

  getOne(quizId: string, questionId: string): Promise<Question> {
    return apiClient.get<Question>(`/quizzes/${quizId}/questions/${questionId}`)
  },

  create(quizId: string, dto: CreateQuestionInput): Promise<Question> {
    return apiClient.post<Question>(`/quizzes/${quizId}/questions`, dto)
  },

  update(quizId: string, questionId: string, dto: UpdateQuestionInput): Promise<Question> {
    return apiClient.patch<Question>(`/quizzes/${quizId}/questions/${questionId}`, dto)
  },

  remove(quizId: string, questionId: string): Promise<void> {
    return apiClient.delete<void>(`/quizzes/${quizId}/questions/${questionId}`)
  },

  reorder(quizId: string, items: ReorderItem[]): Promise<void> {
    return apiClient.patch<void>(`/quizzes/${quizId}/questions/reorder`, { items })
  },
}
