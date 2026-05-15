import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class QuestionOptionDto {
  @IsEnum(['A', 'B', 'C', 'D'])
  label!: 'A' | 'B' | 'C' | 'D';

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  text!: string;
}
