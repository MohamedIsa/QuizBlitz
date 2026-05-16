import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
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

  @ApiProperty({ description: 'Cloudflare Turnstile token' })
  @IsString()
  @IsNotEmpty()
  turnstileToken!: string;
}
