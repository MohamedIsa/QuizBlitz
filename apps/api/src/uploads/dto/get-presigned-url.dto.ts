import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class GetPresignedUrlDto {
  @ApiProperty({ example: 'cover.jpg' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ enum: ['image/jpeg', 'image/png', 'image/webp'] })
  @IsIn(['image/jpeg', 'image/png', 'image/webp'])
  contentType: string;
}
