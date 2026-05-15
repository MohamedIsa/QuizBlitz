import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponseDto {
  @ApiProperty({ description: 'PUT this URL with the file bytes and Content-Type header' })
  uploadUrl!: string;

  @ApiProperty({ description: 'Public URL to read the file after upload completes' })
  publicUrl!: string;

  @ApiProperty({ description: 'R2 object key — store this if you need to delete later' })
  key!: string;
}
