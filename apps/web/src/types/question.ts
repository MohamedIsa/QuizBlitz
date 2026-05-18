export type OptionLabel = 'A' | 'B' | 'C' | 'D'

export interface QuestionOption {
  label: OptionLabel
  text: string
}

export interface Question {
  id: string
  quizId: string
  text: string
  options: QuestionOption[]
  correctOptionIndex: number
  timeLimit: number
  orderIndex: number
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateQuestionDto {
  text: string
  options: QuestionOption[]
  correctOptionIndex: number
  timeLimit: number
  orderIndex?: number
}

export type UpdateQuestionDto = Partial<CreateQuestionDto>
