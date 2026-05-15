import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionOptionDto } from './question-option.dto';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options!: QuestionOptionDto[];

  @IsInt()
  @Min(0)
  @Max(3)
  correctOptionIndex!: number;

  @IsIn([10, 20, 30, 60, 90])
  timeLimit!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
