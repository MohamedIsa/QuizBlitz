import { StyleSheet } from 'react-native'
import { Link } from 'expo-router'
import { Text } from 'react-native-paper'
import { Screen } from '@/components/layout'
import { Button, Card, useSnackbar } from '@/components/ui'
import { FormField } from '@/components/forms'
import { useAuthForm } from '@/hooks/useAuthForm'
import { registerSchema } from '@/validation/auth'
import type { RegisterInput } from '@/validation/auth'
import { useAuthStore } from '@/store/auth'
import { apiClient, APIClientError } from '@/core/api-client'
import { useAppTheme } from '@/theme'

interface RegisterResponse {
  access_token: string
  refresh_token: string
  session_id?: string
  user: { id: string; email: string; name?: string }
}

export default function RegisterScreen() {
  const login = useAuthStore((s) => s.login)
  const { show } = useSnackbar()
  const { colors } = useAppTheme()

  const { control, errors, handleSubmit, isLoading } = useAuthForm<RegisterInput>({
    schema: registerSchema,
    onSubmit: async (data) => {
      const res = await apiClient.post<RegisterResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })
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
        err instanceof APIClientError ? err.message : 'Unable to create account. Please try again.'
      show(message, { type: 'error' })
    },
  })

  return (
    <Screen>
      <Text variant="headlineMedium" style={[styles.title, { color: colors.onBackground }]}>
        Create account
      </Text>

      <Card>
        <FormField<RegisterInput>
          name="name"
          control={control}
          label="Full name"
          error={errors.name}
          placeholder="Jane Doe"
          autoComplete="name"
          returnKeyType="next"
        />

        <FormField<RegisterInput>
          name="email"
          control={control}
          label="Email address"
          error={errors.email}
          keyboardType="email-address"
          placeholder="you@example.com"
          autoComplete="email"
          returnKeyType="next"
        />

        <FormField<RegisterInput>
          name="password"
          control={control}
          label="Password"
          error={errors.password}
          secureTextEntry
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          autoComplete="new-password"
          returnKeyType="next"
          helperText="At least 8 characters, one uppercase letter, one number"
        />

        <FormField<RegisterInput>
          name="confirmPassword"
          control={control}
          label="Confirm password"
          error={errors.confirmPassword}
          secureTextEntry
          placeholder="••••••••"
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Button fullWidth loading={isLoading} onPress={handleSubmit}>
          Create Account
        </Button>
      </Card>

      <Link href="/(auth)/login" style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          Already have an account?{' '}
          <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600' }}>
            Sign in
          </Text>
        </Text>
      </Link>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
  },
  footer: {
    alignSelf: 'center',
    marginTop: 8,
  },
})
