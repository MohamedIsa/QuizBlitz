import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
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

  constructor(private readonly config: ConfigService) {}

  private getStorageConfiguration() {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const bucket = this.config.get<string>('R2_BUCKET_NAME');
    const publicUrl = this.config.get<string>('R2_PUBLIC_URL');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');

    if (!accountId || !bucket || !publicUrl || !accessKeyId || !secretAccessKey) {
      throw new ServiceUnavailableException('R2 uploads are not configured');
    }

    // R2_ENDPOINT overrides the default when set (e.g. MinIO in local dev)
    const endpoint =
      this.config.get<string>('R2_ENDPOINT') ??
      `https://${accountId}.r2.cloudflarestorage.com`;

    const s3 = new S3Client({
      region: 'auto',
      endpoint,
      // MinIO uses path-style URLs (host/bucket/key); R2 uses virtual-hosted style
      forcePathStyle: Boolean(this.config.get<string>('R2_ENDPOINT')),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return { bucket, publicUrl, s3 };
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
    const { bucket, publicUrl, s3 } = this.getStorageConfiguration();
    const ext = dto.filename.includes('.')
      ? dto.filename.split('.').pop()?.toLowerCase() || 'bin'
      : 'bin';
    const key = `uploads/${userId}/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: PRESIGNED_URL_TTL_SECONDS,
    });

    this.logger.log(`Presigned URL generated for key: ${key}`);

    return {
      uploadUrl,
      publicUrl: `${publicUrl}/${key}`,
      key,
    };
  }
}
