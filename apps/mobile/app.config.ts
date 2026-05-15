import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
  const easProjectId = process.env.EAS_PROJECT_ID

  if (!easProjectId && process.env.EXPO_PUBLIC_ENV === 'production') {
    throw new Error('EAS_PROJECT_ID environment variable is required in production builds')
  }

  return {
    ...(config as ExpoConfig),
    extra: {
      ...(config.extra ?? {}),
      eas: {
        projectId: easProjectId ?? '',
      },
    },
    updates: {
      ...(config.updates ?? {}),
      url: easProjectId ? `https://u.expo.dev/${easProjectId}` : undefined,
    },
  }
}
