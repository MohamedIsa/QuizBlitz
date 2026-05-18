import { apiClient } from '@/lib/api-client'
import type { Envelope } from '@/lib/api-client'
import type { Quiz, CreateQuizDto, UpdateQuizDto } from '@/types/quiz'

export const quizApi = {
  getAll: (): Promise<Quiz[]> =>
    apiClient.get<Envelope<Quiz[]>>('/quizzes').then(r => r.data.data),

  getOne: (id: string): Promise<Quiz> =>
    apiClient.get<Envelope<Quiz>>(`/quizzes/${id}`).then(r => r.data.data),

  create: (dto: CreateQuizDto): Promise<Quiz> =>
    apiClient.post<Envelope<Quiz>>('/quizzes', dto).then(r => r.data.data),

  update: (id: string, dto: UpdateQuizDto): Promise<Quiz> =>
    apiClient.patch<Envelope<Quiz>>(`/quizzes/${id}`, dto).then(r => r.data.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete<Envelope<void>>(`/quizzes/${id}`).then(r => r.data.data),
}
