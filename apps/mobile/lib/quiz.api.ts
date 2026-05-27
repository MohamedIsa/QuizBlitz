import { apiClient } from '@/core/api-client'
import type { Quiz, CreateQuizInput, UpdateQuizInput } from '@/validation/quiz'

export const quizApi = {
  getAll(): Promise<Quiz[]> {
    return apiClient.get<Quiz[]>('/quizzes')
  },

  getOne(id: string): Promise<Quiz> {
    return apiClient.get<Quiz>(`/quizzes/${id}`)
  },

  create(dto: CreateQuizInput): Promise<Quiz> {
    return apiClient.post<Quiz>('/quizzes', dto)
  },

  update(id: string, dto: UpdateQuizInput): Promise<Quiz> {
    return apiClient.patch<Quiz>(`/quizzes/${id}`, dto)
  },

  remove(id: string): Promise<void> {
    return apiClient.delete<void>(`/quizzes/${id}`)
  },
}
