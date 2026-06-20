import { resolveDatabaseUrl } from './database-url';

describe('resolveDatabaseUrl', () => {
  it('uses an explicit managed database URL when provided', () => {
    const databaseUrl =
      'postgresql://postgres.project:secret@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require';

    expect(resolveDatabaseUrl({ DATABASE_URL: databaseUrl })).toBe(databaseUrl);
  });

  it('builds a Docker PostgreSQL URL when DATABASE_URL is absent', () => {
    expect(
      resolveDatabaseUrl({
        DB_HOST: 'postgres',
        DB_PORT: '5432',
        DB_USER: 'quizblitz_user',
        DB_PASSWORD: 'local_password',
        DB_NAME: 'quizblitz',
      }),
    ).toBe(
      'postgresql://quizblitz_user:local_password@postgres:5432/quizblitz',
    );
  });

  it('encodes reserved characters in local credentials', () => {
    expect(
      resolveDatabaseUrl({
        DB_HOST: 'postgres',
        DB_PORT: '5432',
        DB_USER: 'quizblitz_user',
        DB_PASSWORD: 'p@ss/word',
        DB_NAME: 'quizblitz',
      }),
    ).toBe('postgresql://quizblitz_user:p%40ss%2Fword@postgres:5432/quizblitz');
  });

  it('fails fast when neither connection configuration is complete', () => {
    expect(() =>
      resolveDatabaseUrl({
        DB_HOST: 'postgres',
        DB_PORT: '5432',
        DB_USER: 'quizblitz_user',
      }),
    ).toThrow(
      'DATABASE_URL is required unless all local database variables are set',
    );
  });
});
