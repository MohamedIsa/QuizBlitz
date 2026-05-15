import { IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { QuizStatus } from '../quiz-status.enum';

export class CreateQuizDto {
  @IsString()
  @Length(1, 150)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;
}
