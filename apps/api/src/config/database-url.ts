const LOCAL_DATABASE_VARIABLES = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
] as const;

type LocalDatabaseVariable = (typeof LOCAL_DATABASE_VARIABLES)[number];

/**
 * Resolves the single database connection string used by NestJS and TypeORM.
 * A managed database supplies DATABASE_URL; Docker development derives one
 * from the existing DB_* variables so the two environments use one contract.
 */
export function resolveDatabaseUrl(
  environment: Record<string, unknown>,
): string {
  const configuredUrl = readEnvironmentValue(environment, 'DATABASE_URL');
  if (configuredUrl) {
    return configuredUrl;
  }

  const localDatabaseConfig = getLocalDatabaseConfig(environment);
  const databaseUrl = new URL('postgresql://localhost');

  databaseUrl.username = localDatabaseConfig.DB_USER;
  databaseUrl.password = localDatabaseConfig.DB_PASSWORD;
  databaseUrl.hostname = localDatabaseConfig.DB_HOST;
  databaseUrl.port = localDatabaseConfig.DB_PORT;
  databaseUrl.pathname = localDatabaseConfig.DB_NAME;

  return databaseUrl.toString();
}

function getLocalDatabaseConfig(
  environment: Record<string, unknown>,
): Record<LocalDatabaseVariable, string> {
  const missingVariables = LOCAL_DATABASE_VARIABLES.filter(
    (variable) => !readEnvironmentValue(environment, variable),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `DATABASE_URL is required unless all local database variables are set: ${missingVariables.join(', ')}`,
    );
  }

  return Object.fromEntries(
    LOCAL_DATABASE_VARIABLES.map((variable) => [
      variable,
      readEnvironmentValue(environment, variable),
    ]),
  ) as Record<LocalDatabaseVariable, string>;
}

function readEnvironmentValue(
  environment: Record<string, unknown>,
  variable: string,
): string | undefined {
  const value = environment[variable];

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
