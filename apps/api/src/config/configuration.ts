import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, validateSync } from 'class-validator';
import { resolveDatabaseUrl } from './database-url';

class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string;

  // Individual DB_* vars are retained for the Postgres container init
  // (docker-compose), but the app itself connects via DATABASE_URL.
  @IsString()
  @IsOptional()
  DB_HOST?: string;

  @IsInt()
  @IsOptional()
  DB_PORT?: number;

  @IsString()
  @IsOptional()
  DB_USER?: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  DB_NAME?: string;

  @IsString()
  @IsOptional()
  NODE_ENV?: string;

  @IsInt()
  @IsOptional()
  PORT?: number;

  @IsString()
  JWT_PRIVATE_KEY!: string;

  @IsString()
  JWT_PUBLIC_KEY!: string;

  @IsString()
  JWT_ACCESS_EXPIRY!: string;

  @IsString()
  JWT_REFRESH_EXPIRY!: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string;

  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  FROM_EMAIL?: string;

  @IsString()
  @IsOptional()
  R2_ACCOUNT_ID?: string;

  @IsString()
  @IsOptional()
  R2_ACCESS_KEY_ID?: string;

  @IsString()
  @IsOptional()
  R2_SECRET_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  R2_BUCKET_NAME?: string;

  @IsString()
  @IsOptional()
  R2_PUBLIC_URL?: string;

  @IsString()
  @IsOptional()
  R2_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsInt()
  @IsOptional()
  SMTP_PORT?: number;

  @IsString()
  @IsOptional()
  TURNSTILE_SECRET_KEY?: string;
}

export function validateConfig(config: Record<string, unknown>) {
  const configWithDatabaseUrl = {
    ...config,
    DATABASE_URL: resolveDatabaseUrl(config),
  };
  const validated = plainToInstance(
    EnvironmentVariables,
    configWithDatabaseUrl,
    {
      enableImplicitConversion: true,
    },
  );
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('; '),
    );
  }

  return validated;
}
