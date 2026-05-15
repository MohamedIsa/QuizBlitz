import { StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Screen } from '@/components/layout'
import { Button, Card, Divider, useSnackbar } from '@/components/ui'
import { FormField } from '@/components/forms'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { loginSchema } from '@/validation/auth'
import type { LoginInput } from '@/validation/auth'
import { useAuthStore } from '@/store/auth'
import { apiClient, APIClientError } from '@/core/api-client'
import { useAppTheme } from '@/theme'

interface LoginResponse {
  access_token: string
  refresh_token: string
  session_id?: string
  user: { id: string; email: string; name?: string }
}

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const biometricLogin = useAuthStore((s) => s.biometricLogin)
  const { show } = useSnackbar()
  const { colors } = useAppTheme()
  const { isEnabled, canUseBiometrics, biometricType, authenticate } = useBiometricAuth()

  const { control, errors, handleSubmit, isLoading } = useAuthForm<LoginInput>({
    schema: loginSchema,
    onSubmit: async (data) => {
      const res = await apiClient.post<LoginResponse>('/auth/login', data)
      await login(
        {
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          sessionId: res.session_id,
        },
        res.user,
      )
    },
    onError: (err) => {
      const message =
        err instanceof APIClientError ? err.message : 'Unable to sign in. Please try again.'
      show(message, { type: 'error' })
    },
  })

  const handleBiometricLogin = async () => {
    const { success, cancelled } = await authenticate('Sign in to your account')
    if (cancelled) return
    if (!success) {
      show('Biometric authentication failed', { type: 'error' })
      return
    }
    try {
      await biometricLogin()
      // isAuthenticated is now true — route guard handles navigation to /(tabs)
    } catch (err) {
      const message =
        err instanceof APIClientError ? err.message : 'Unable to sign in. Please use your password.'
      show(message, { type: 'error' })
    }
  }

  return (
    <Screen centered>
      <Text variant="headlineMedium" style={[styles.title, { color: colors.onBackground }]}>
        Welcome back
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
        Sign in to your account
      </Text>

      <Card>
        <FormField<LoginInput>
          name="email"
          control={control}
          label="Email address"
          error={errors.email}
          keyboardType="email-address"
          placeholder="you@example.com"
          autoComplete="email"
          returnKeyType="next"
        />

        <FormField<LoginInput>
          name="password"
          control={control}
          label="Password"
          error={errors.password}
          secureTextEntry
          placeholder="••••••••"
          autoComplete="current-password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
          <Text variant="labelMedium" style={{ color: colors.primary }}>
            Forgot password?
          </Text>
        </Link>

        <Button fullWidth loading={isLoading} onPress={handleSubmit}>
          Sign In
        </Button>

        {isEnabled && canUseBiometrics && (
          <>
            <Divider spacing={4} />
            <Button
              fullWidth
              mode="outlined"
              onPress={handleBiometricLogin}
              icon={({ size, color }) => (
                <MaterialCommunityIcons
                  name={biometricType === 'facial' ? 'face-recognition' : 'fingerprint'}
                  size={size}
                  color={color}
                />
              )}
            >
              {biometricType === 'facial' ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}
            </Button>
          </>
        )}
      </Card>

      <Link href="/(auth)/register" style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          Don&apos;t have an account?{' '}
          <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600' }}>
            Create one
          </Text>
        </Text>
      </Link>

      {__DEV__ && (
        <Button
          mode="text"
          onPress={() =>
            login(
              { accessToken: 'dev-token', refreshToken: 'dev-refresh' },
              { id: 'dev-1', email: 'dev@example.com', name: 'Dev User' },
            )
          }
          style={styles.devBypass}
          textColor={colors.onSurfaceVariant}
        >
          [DEV] Skip login
        </Button>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  footer: {
    alignSelf: 'center',
    marginTop: 8,
  },
  devBypass: {
    marginTop: 16,
    opacity: 0.5,
  },
})
