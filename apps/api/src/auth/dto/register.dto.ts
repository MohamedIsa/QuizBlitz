import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'host@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'QuizMaster', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  displayName!: string;

  @ApiPropertyOptional({ description: 'Cloudflare Turnstile token (web only)' })
  @IsOptional()
  @IsString()
  turnstileToken?: string;
}
