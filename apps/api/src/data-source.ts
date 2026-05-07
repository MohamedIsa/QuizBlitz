import * as path from 'path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// __dirname is apps/api/src — three levels up reaches the workspace root .env
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
