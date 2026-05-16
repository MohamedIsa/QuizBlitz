import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useWatch } from 'react-hook-form'
import { router, useLocalSearchParams } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/forms'
import { QBText, useSnackbar } from '@/components/ui'
import { useAuthForm } from '@/hooks/useAuthForm'
import { resetPasswordSchema } from '@/validation/auth'
import type { ResetPasswordInput } from '@/validation/auth'
import { APIClientError } from '@/core/api-client'
import { authService } from '@/services/authService'
import { tokens } from '@/theme/tokens'

const REQUIREMENTS = [
  { key: 'length',  text: 'At least 8 characters',  test: (p: string) => p.length >= 8 },
  { key: 'number',  text: 'One number',              test: (p: string) => /\d/.test(p) },
  { key: 'case',    text: 'Upper & lower case',      test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { key: 'special', text: 'One special character',   test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
]

function getStrength(score: number) {
  if (score <= 1) return { label: 'Weak',   color: tokens.color.semantic.wrong }
  if (score === 2) return { label: 'Fair',   color: tokens.color.brand.yellow }
  if (score === 3) return { label: 'Good',   color: tokens.color.semantic.correct }
  return              { label: 'Strong', color: tokens.color.semantic.correct }
}

export default function ResetPasswordScreen() {
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>()
  const { show } = useSnackbar()

  const { control, errors, handleSubmit, isLoading } = useAuthForm<ResetPasswordInput>({
    schema: resetPasswordSchema,
    defaultValues: { password: '', confirmPassword: '' },
    onSubmit: async (data) => {
      await authService.resetPassword(resetToken, data.password)
      router.replace({ pathname: '/(auth)/success', params: { context: 'reset' } })
    },
    onError: (err) => {
      const message =
        err instanceof APIClientError ? err.message : 'Something went wrong. Please try again.'
      show(message, { type: 'error' })
    },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''
  const reqs = REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) }))
  const score = reqs.filter((r) => r.met).length
  const strength = getStrength(score)
  const showMeter = password.length > 0

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    handleSubmit()
  }

  return (
    <AuthShell
      title="Set a new password"
      sub="Choose something memorable. You'll use it to sign in next time."
    >
      <View style={styles.fields}>
        <View>
          <FormField<ResetPasswordInput>
            name="password"
            control={control}
            label="New password"
            error={errors.password}
            secureTextEntry
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
            returnKeyType="next"
          />

          {showMeter && (
            <View style={styles.meterRow}>
              <View style={styles.bars}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      { backgroundColor: i < score ? strength.color : tokens.color.ink.surface3 },
                    ]}
                  />
                ))}
              </View>
              <QBText variant="caption" style={{ color: strength.color, fontFamily: tokens.font.uiSemibold }}>
                {strength.label}
              </QBText>
            </View>
          )}
        </View>

        <FormField<ResetPasswordInput>
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
      </View>

      <View style={styles.requirementsBox}>
        <QBText variant="caption" color="muted" style={styles.requirementsTitle}>
          Requirements
        </QBText>
        {reqs.map((r) => (
          <View key={r.key} style={styles.reqRow}>
            <View style={[styles.reqDot, r.met && styles.reqDotMet]}>
              {r.met && (
                <MaterialCommunityIcons name="check" size={9} color="#fff" />
              )}
            </View>
            <QBText variant="bodyXs" color={r.met ? 'ink' : 'muted'}>
              {r.text}
            </QBText>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={isLoading}
      >
        <QBText variant="labelBold" color="onDark">
          {isLoading ? 'Updating…' : 'Update password'}
        </QBText>
      </TouchableOpacity>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  fields: {
    gap: 14,
    marginTop: 4,
  },
  meterRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  requirementsBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: tokens.color.ink.surface2,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.ink.borderSoft,
  },
  requirementsTitle: {
    fontFamily: tokens.font.uiSemibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  reqDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: tokens.color.ink.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reqDotMet: {
    backgroundColor: tokens.color.semantic.correct,
    borderColor: tokens.color.semantic.correct,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
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
