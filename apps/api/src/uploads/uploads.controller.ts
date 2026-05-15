import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned')
  @ApiOperation({
    summary: 'Get a presigned R2 URL for direct image upload',
    description:
      'Client must enforce a 5 MB file size limit before calling this endpoint. ' +
      'PUT the file bytes to uploadUrl with the matching Content-Type header.',
  })
  @ApiCreatedResponse({ type: PresignedUrlResponseDto })
  getPresignedUrl(
    @CurrentUser() user: UserPayload,
    @Body() dto: GetPresignedUrlDto,
  ): Promise<PresignedUrlResponseDto> {
    return this.uploadsService.getPresignedUrl(user.id, dto);
  }
}
