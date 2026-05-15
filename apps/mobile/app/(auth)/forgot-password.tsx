import { StyleSheet } from 'react-native'
import { Link, router } from 'expo-router'
import { Text } from 'react-native-paper'
import { Screen } from '@/components/layout'
import { Button, Card, useSnackbar } from '@/components/ui'
import { FormField } from '@/components/forms'
import { useAuthForm } from '@/hooks/useAuthForm'
import { forgotPasswordSchema } from '@/validation/auth'
import type { ForgotPasswordInput } from '@/validation/auth'
import { apiClient, APIClientError } from '@/core/api-client'
import { useAppTheme } from '@/theme'

export default function ForgotPasswordScreen() {
  const { show } = useSnackbar()
  const { colors } = useAppTheme()

  const { control, errors, handleSubmit, isLoading } = useAuthForm<ForgotPasswordInput>({
    schema: forgotPasswordSchema,
    onSubmit: async (data) => {
      await apiClient.post('/auth/forgot-password', data, { skipAuth: true })
      show('Check your email for a reset link', { type: 'success' })
      router.replace('/(auth)/login')
    },
    onError: (err) => {
      const message =
        err instanceof APIClientError ? err.message : 'Something went wrong. Please try again.'
      show(message, { type: 'error' })
    },
  })

  return (
    <Screen centered>
      <Text variant="headlineMedium" style={[styles.title, { color: colors.onBackground }]}>
        Reset password
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
        Enter your email and we&apos;ll send you a reset link
      </Text>

      <Card>
        <FormField<ForgotPasswordInput>
          name="email"
          control={control}
          label="Email address"
          error={errors.email}
          keyboardType="email-address"
          placeholder="you@example.com"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Button fullWidth loading={isLoading} onPress={handleSubmit}>
          Send Reset Link
        </Button>
      </Card>

      <Link href="/(auth)/login" style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: colors.primary }}>
          Back to sign in
        </Text>
      </Link>
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
  footer: {
    alignSelf: 'center',
    marginTop: 8,
  },
})
