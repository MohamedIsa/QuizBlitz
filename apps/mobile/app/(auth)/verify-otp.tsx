import { useEffect, useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Controller } from 'react-hook-form'
import { router, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthShell } from '@/components/auth/AuthShell'
import { PinInput } from '@/components/auth/PinInput'
import { QBText, useSnackbar } from '@/components/ui'
import { useAuthForm } from '@/hooks/useAuthForm'
import { otpSchema } from '@/validation/auth'
import type { OtpInput } from '@/validation/auth'
import { APIClientError } from '@/core/api-client'
import { authService } from '@/services/authService'
import { tokens } from '@/theme/tokens'

const OTP_TTL_SECONDS = 5 * 60

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const { show } = useSnackbar()
  const [seconds, setSeconds] = useState(OTP_TTL_SECONDS)
  const expired = seconds <= 0

  useEffect(() => {
    if (expired) return
    const t = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [expired])

  const timerLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email)
      setSeconds(OTP_TTL_SECONDS)
      show('Code resent!', { type: 'success' })
    } catch {
      show('Could not resend code. Please try again.', { type: 'error' })
    }
  }

  const { control, errors, handleSubmit, isLoading } = useAuthForm<OtpInput>({
    schema: otpSchema,
    defaultValues: { code: '' },
    onSubmit: async (data) => {
      const res = await authService.verifyOtp(email, data.code)
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email, resetToken: res.resetToken },
      })
    },
    onError: (err) => {
      const message =
        err instanceof APIClientError ? err.message : 'Invalid or expired code. Try again.'
      show(message, { type: 'error' })
    },
  })

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    handleSubmit()
  }

  return (
    <AuthShell
      title="Enter the code"
      sub={
        <>
          {'We sent a 6-digit code to '}
          <QBText variant="labelSemibold" color="violet">{email}</QBText>
        </>
      }
    >
      <View style={styles.pinWrapper}>
        <Controller
          control={control}
          name="code"
          render={({ field: { value, onChange } }) => (
            <PinInput value={value ?? ''} onChange={onChange} error={!!errors.code} />
          )}
        />
        {errors.code ? (
          <QBText variant="bodyXs" color="error" style={styles.errorText}>
            {errors.code.message}
          </QBText>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.timerRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={tokens.color.ink.muted} />
          <QBText variant="bodySm" color="muted">
            {'Code expires in '}
            <QBText
              variant="labelSemibold"
              style={{ color: expired ? tokens.color.semantic.wrong : tokens.color.ink.ink }}
            >
              {expired ? 'Expired' : timerLabel}
            </QBText>
          </QBText>
        </View>
        <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
          <QBText variant="labelSemibold" color="violet">Resend</QBText>
        </TouchableOpacity>
      </View>

      <View style={styles.autofillHint}>
        <MaterialCommunityIcons name="email-outline" size={16} color={tokens.color.brand.violet} />
        <QBText variant="bodySmMedium" style={styles.autofillText}>
          We can auto-fill the code from your email — just tap to allow.
        </QBText>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={isLoading}
      >
        <QBText variant="labelBold" color="onDark">
          {isLoading ? 'Verifying…' : 'Verify code'}
        </QBText>
      </TouchableOpacity>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  pinWrapper: {
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autofillHint: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brand.violetTint,
    borderWidth: 1,
    borderColor: tokens.color.brand.violetSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  autofillText: {
    color: tokens.color.brand.violetDeep,
    flex: 1,
    lineHeight: 18,
  },
  spacer: {
    flex: 1,
    minHeight: 28,
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
})
