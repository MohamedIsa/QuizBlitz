import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/forms'
import { QBText, useSnackbar } from '@/components/ui'
import { useAuthForm } from '@/hooks/useAuthForm'
import { forgotPasswordSchema } from '@/validation/auth'
import type { ForgotPasswordInput } from '@/validation/auth'
import { APIClientError } from '@/core/api-client'
import { authService } from '@/services/authService'
import { tokens } from '@/theme/tokens'

export default function ForgotPasswordScreen() {
  const { show } = useSnackbar()

  const { control, errors, handleSubmit, isLoading } = useAuthForm<ForgotPasswordInput>({
    schema: forgotPasswordSchema,
    defaultValues: { email: '' },
    onSubmit: async (data) => {
      await authService.forgotPassword(data.email)
      router.push({ pathname: '/(auth)/verify-otp', params: { email: data.email } })
    },
    onError: (err) => {
      const message =
        err instanceof APIClientError ? err.message : 'Something went wrong. Please try again.'
      show(message, { type: 'error' })
    },
  })

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    handleSubmit()
  }

  return (
    <AuthShell
      title="Forgot password?"
      sub="Enter your email and we'll send you a 6-digit code to reset it."
    >
      <View style={styles.illustrationWrapper}>
        <View style={styles.illustrationCircle}>
          <MaterialCommunityIcons name="lock-outline" size={48} color={tokens.color.brand.violet} />
          <View style={styles.illustrationBadge}>
            <QBText variant="displayXs" style={styles.badgeText}>?</QBText>
          </View>
        </View>
      </View>

      <FormField<ForgotPasswordInput>
        name="email"
        control={control}
        label="Email"
        error={errors.email}
        keyboardType="email-address"
        placeholder="you@example.com"
        autoComplete="email"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
          onPress={handlePress}
          activeOpacity={0.85}
          disabled={isLoading}
        >
          <QBText variant="labelBold" color="onDark">
            {isLoading ? 'Sending…' : 'Send reset code'}
          </QBText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
          <QBText variant="bodySm" color="muted" style={styles.footer}>
            {'Remembered it? '}
            <QBText variant="labelSemibold" color="violet">Back to sign in</QBText>
          </QBText>
        </TouchableOpacity>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  illustrationWrapper: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  illustrationCircle: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: tokens.color.brand.violetTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.color.brand.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 18,
    color: tokens.color.ink.ink,
  },
  spacer: {
    flex: 1,
    minHeight: 28,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    height: 52,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brand.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  footer: {
    textAlign: 'center',
  },
})
