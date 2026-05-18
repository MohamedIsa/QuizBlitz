export type QuizStatus = 'draft' | 'published'

export interface Quiz {
  id: string
  title: string
  description: string | null
  status: QuizStatus
  coverImageUrl: string | null
  hostId: string
  createdAt: string
  updatedAt: string
}

export interface CreateQuizDto {
  title: string
  description?: string
}

export interface UpdateQuizDto {
  title?: string
  description?: string
  status?: QuizStatus
}
