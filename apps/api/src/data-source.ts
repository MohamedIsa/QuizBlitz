import * as path from 'path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolveDatabaseUrl } from './config/database-url';

// __dirname is apps/api/src — three levels up reaches the workspace root .env
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

const databaseUrl = resolveDatabaseUrl(process.env);

// Supabase / managed Postgres put sslmode=require in the URL — switch on it.
const requireSsl = databaseUrl.includes('sslmode=require');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  ssl: requireSsl ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
