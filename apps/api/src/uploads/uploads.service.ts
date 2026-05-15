import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto';

const PRESIGNED_URL_TTL_SECONDS = 300; // 5 minutes — sufficient for any mobile upload

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.getOrThrow<string>('R2_ACCOUNT_ID');
    this.bucket = config.getOrThrow<string>('R2_BUCKET_NAME');
    this.publicUrl = config.getOrThrow<string>('R2_PUBLIC_URL');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Generates a presigned PUT URL for direct-to-R2 upload.
   * The caller must PUT file bytes to uploadUrl with the matching Content-Type header.
   * Note: presigned PUT does not enforce a max upload size — that is a known R2 limitation.
   * The client is responsible for enforcing the 5 MB limit before requesting a URL.
   *
   * @param userId - ID of the authenticated host; used to namespace the R2 object key
   * @param dto - filename and MIME type requested by the client
   * @returns uploadUrl (PUT here), publicUrl (read from here after upload), key
   */
  async getPresignedUrl(userId: string, dto: GetPresignedUrlDto): Promise<PresignedUrlResponseDto> {
    const ext = dto.filename.split('.').pop()?.toLowerCase() ?? 'bin';
    const key = `uploads/${userId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });

    this.logger.log(`Presigned URL generated for key: ${key}`);

    return {
      uploadUrl,
      publicUrl: `${this.publicUrl}/${key}`,
      key,
    };
  }
}
