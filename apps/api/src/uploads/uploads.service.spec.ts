import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { UploadsService } from './uploads.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((input) => input),
}));

const CONFIG_VALUES: Record<string, string> = {
  R2_ACCOUNT_ID: 'test-account',
  R2_BUCKET_NAME: 'quizblitz-dev',
  R2_PUBLIC_URL: 'https://pub.r2.dev',
  R2_ACCESS_KEY_ID: 'access-key',
  R2_SECRET_ACCESS_KEY: 'secret-key',
};

const TEST_USER_ID = 'user-abc-123';

describe('GetPresignedUrlDto', () => {
  it('rejects an invalid contentType', async () => {
    const dto = plainToInstance(GetPresignedUrlDto, {
      filename: 'cover.jpg',
      contentType: 'application/pdf',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'contentType')).toBe(true);
  });

  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'accepts valid contentType: %s',
    async (contentType) => {
      const dto = plainToInstance(GetPresignedUrlDto, {
        filename: 'cover.jpg',
        contentType,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    },
  );
});

describe('UploadsService', () => {
  let service: UploadsService;
  const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

  beforeEach(async () => {
    mockGetSignedUrl.mockResolvedValue('https://signed-url.example.com/put');

    const module = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => CONFIG_VALUES[key]),
          },
        },
      ],
    }).compile();

    service = module.get(UploadsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getPresignedUrl', () => {
    it('returns the signed URL from R2 as uploadUrl', async () => {
      const result = await service.getPresignedUrl(TEST_USER_ID, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.uploadUrl).toBe('https://signed-url.example.com/put');
    });

    it('namespaces the key under the userId', async () => {
      const result = await service.getPresignedUrl(TEST_USER_ID, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.key).toMatch(new RegExp(`^uploads/${TEST_USER_ID}/`));
    });

    it('uses only the file extension in the key, not the full filename', async () => {
      const result = await service.getPresignedUrl(TEST_USER_ID, {
        filename: 'my-cover-photo.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.key).toMatch(/^uploads\/.+\/[a-f0-9-]+\.jpg$/);
      expect(result.key).not.toContain('my-cover-photo');
    });

    it('builds publicUrl from R2_PUBLIC_URL config and the generated key', async () => {
      const result = await service.getPresignedUrl(TEST_USER_ID, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.publicUrl).toMatch(/^https:\/\/pub\.r2\.dev\/uploads\/.+\.jpg$/);
    });

    it('key and publicUrl are consistent with each other', async () => {
      const result = await service.getPresignedUrl(TEST_USER_ID, {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      });

      expect(result.publicUrl).toBe(`https://pub.r2.dev/${result.key}`);
    });

    it('falls back to .bin extension when filename has no extension', async () => {
      const result = await service.getPresignedUrl(TEST_USER_ID, {
        filename: 'noextension',
        contentType: 'image/jpeg',
      });

      expect(result.key).toMatch(/\.bin$/);
    });
  });
});
