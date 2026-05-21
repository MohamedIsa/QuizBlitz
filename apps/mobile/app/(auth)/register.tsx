import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Link, router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/forms'
import { GoogleIcon, QBText, useSnackbar } from '@/components/ui'
import { useAuthForm } from '@/hooks/useAuthForm'
import { registerSchema } from '@/validation/auth'
import type { RegisterInput } from '@/validation/auth'
import { useAuthStore } from '@/store/auth'
import { APIClientError } from '@/core/api-client'
import { authService } from '@/services/authService'
import { tokens } from '@/theme/tokens'

WebBrowser.maybeCompleteAuthSession()

const STRENGTH_CHECKS = [
  (p: string) => p.length >= 8,
  (p: string) => /\d/.test(p),
  (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p),
  (p: string) => /[^a-zA-Z0-9]/.test(p),
]

function getStrength(score: number) {
  if (score <= 1) return { label: 'Weak', color: tokens.color.semantic.wrong }
  if (score === 2) return { label: 'Fair', color: tokens.color.brand.yellow }
  if (score === 3) return { label: 'Good', color: tokens.color.semantic.correct }
  return { label: 'Strong', color: tokens.color.semantic.correct }
}

interface RegisterResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; displayName: string }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL_LOCAL ?? process.env.EXPO_PUBLIC_API_URL ?? ''

export default function RegisterScreen() {
  const login = useAuthStore((s) => s.login)
  const { show } = useSnackbar()
  const [termsAccepted, setTermsAccepted] = useState(false)

  const { control, errors, handleSubmit, isLoading } = useAuthForm<RegisterInput>({
    schema: registerSchema,
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    onSubmit: async (data) => {
      if (!termsAccepted) {
        show('Please accept the Terms and Privacy Policy.', { type: 'info' })
        return
      }
      const res = await authService.register({
        displayName: data.name,
        email: data.email,
        password: data.password,
      })
      await login(
        { accessToken: res.accessToken, refreshToken: res.refreshToken },
        { id: res.user.id, email: res.user.email, name: res.user.displayName },
      )
      router.replace({ pathname: '/(auth)/success', params: { context: 'registered' } })
    },
    onError: (err) => {
      const message =
        err instanceof APIClientError ? err.message : 'Unable to create account. Please try again.'
      show(message, { type: 'error' })
    },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''
  const score = STRENGTH_CHECKS.filter((fn) => fn(password)).length
  const strength = getStrength(score)
  const showMeter = password.length > 0

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    handleSubmit()
  }

  const handleGoogleSignIn = async () => {
    const result = await WebBrowser.openAuthSessionAsync(
      `${API_URL}/auth/google`,
      'quizblitz://auth/callback',
    )
    if (result.type !== 'success') return
    try {
      const url = new URL(result.url)
      const accessToken = url.searchParams.get('accessToken') ?? ''
      const refreshToken = url.searchParams.get('refreshToken') ?? ''
      if (!accessToken) {
        show('Google sign-in failed. Please try again.', { type: 'error' })
        return
      }
      const user = await authService.getMe(accessToken)
      await login(
        { accessToken, refreshToken },
        { id: user.id, email: user.email, name: user.displayName },
      )
      router.replace('/(tabs)')
    } catch {
      show('Google sign-in failed. Please try again.', { type: 'error' })
    }
  }

  const actions = (
    <>
      <TouchableOpacity
        style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={isLoading}
      >
        <QBText variant="labelBold" color="onDark">
          {isLoading ? 'Creating account…' : 'Create account'}
        </QBText>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <QBText variant="caption" color="muted" style={styles.dividerText}>or</QBText>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} activeOpacity={0.8}>
        <GoogleIcon size={20} />
        <QBText variant="labelSemibold" style={styles.googleBtnText}>Continue with Google</QBText>
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <QBText variant="bodySm" color="muted">Already have an account?{' '}</QBText>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity activeOpacity={0.7}>
            <QBText variant="labelSemibold" color="violet">Sign in</QBText>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  )

  return (
    <AuthShell
      title="Create your account"
      sub="Save your scores, climb leaderboards, and rejoin sessions across devices."
      footer={actions}
    >
      <View style={styles.fields}>
        <FormField<RegisterInput>
          name="name"
          control={control}
          label="Full name"
          error={errors.name}
          placeholder="Carol Chen"
          autoComplete="name"
          returnKeyType="next"
        />

        <FormField<RegisterInput>
          name="email"
          control={control}
          label="Email"
          error={errors.email}
          keyboardType="email-address"
          placeholder="you@example.com"
          autoComplete="email"
          returnKeyType="next"
        />

        <View>
          <FormField<RegisterInput>
            name="password"
            control={control}
            label="Password"
            error={errors.password}
            secureTextEntry
            placeholder="••••••••"
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
              <QBText
                variant="caption"
                style={{ color: strength.color, fontFamily: tokens.font.uiSemibold }}
              >
                {strength.label}
              </QBText>
            </View>
          )}
        </View>

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
      </View>

      <View style={styles.termsRow}>
        <TouchableOpacity
          onPress={() => setTermsAccepted((v) => !v)}
          activeOpacity={0.7}
        >
          <View style={[styles.termsCheckbox, termsAccepted && styles.termsCheckboxChecked]}>
            {termsAccepted && <MaterialCommunityIcons name="check" size={12} color="#fff" />}
          </View>
        </TouchableOpacity>
        <View style={styles.termsTextRow}>
          <QBText variant="bodyXs" color="soft">I agree to the </QBText>
          <TouchableOpacity activeOpacity={0.7}>
            <QBText variant="labelSemibold" color="violet" style={styles.termsLinkSize}>Terms</QBText>
          </TouchableOpacity>
          <QBText variant="bodyXs" color="soft"> and </QBText>
          <TouchableOpacity activeOpacity={0.7}>
            <QBText variant="labelSemibold" color="violet" style={styles.termsLinkSize}>Privacy Policy</QBText>
          </TouchableOpacity>
        </View>
      </View>

    </AuthShell>
  )
}

const styles = StyleSheet.create({
  fields: {
    gap: 16,
  },
  meterRow: {
    marginTop: 8,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 22,
  },
  termsCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: tokens.color.ink.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  termsCheckboxChecked: {
    backgroundColor: tokens.color.brand.violet,
    borderColor: tokens.color.brand.violet,
  },
  termsTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  termsLinkSize: {
    fontSize: 12,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.color.ink.border,
  },
  dividerText: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  googleBtn: {
    height: 52,
    borderRadius: tokens.radius.md,
    borderWidth: 1.5,
    borderColor: tokens.color.ink.border,
    backgroundColor: tokens.color.ink.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleBtnText: {
    fontSize: 15,
    color: tokens.color.ink.ink,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
})
