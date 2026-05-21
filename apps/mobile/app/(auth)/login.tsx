import { useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Link, router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthShell } from '@/components/auth/AuthShell'
import { FormField } from '@/components/forms'
import { GoogleIcon, QBText, useSnackbar } from '@/components/ui'
import { useAuthForm } from '@/hooks/useAuthForm'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { loginSchema } from '@/validation/auth'
import type { LoginInput } from '@/validation/auth'
import { useAuthStore } from '@/store/auth'
import { APIClientError } from '@/core/api-client'
import { authService } from '@/services/authService'
import { tokens } from '@/theme/tokens'

WebBrowser.maybeCompleteAuthSession()

const API_URL = process.env.EXPO_PUBLIC_API_URL_LOCAL ?? process.env.EXPO_PUBLIC_API_URL ?? ''

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const biometricLogin = useAuthStore((s) => s.biometricLogin)
  const { show } = useSnackbar()
  const { isEnabled, canUseBiometrics, biometricType, authenticate } = useBiometricAuth()
  const [rememberMe, setRememberMe] = useState(true)

  const { control, errors, handleSubmit, isLoading } = useAuthForm<LoginInput>({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
    onSubmit: async (data) => {
      const res = await authService.login(data.email, data.password)
      await login(
        { accessToken: res.accessToken, refreshToken: res.refreshToken },
        { id: res.user.id, email: res.user.email, name: res.user.displayName },
      )
      router.replace('/(tabs)')
    },
    onError: (err) => {
      const message =
        err instanceof APIClientError ? err.message : 'Unable to sign in. Please try again.'
      show(message, { type: 'error' })
    },
  })

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
      await login({ accessToken, refreshToken }, { id: user.id, email: user.email, name: user.displayName })
      router.replace('/(tabs)')
    } catch {
      show('Google sign-in failed. Please try again.', { type: 'error' })
    }
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    handleSubmit()
  }

  const handleBiometricLogin = async () => {
    const { success, cancelled } = await authenticate('Sign in to your account')
    if (cancelled) return
    if (!success) {
      show('Biometric authentication failed', { type: 'error' })
      return
    }
    try {
      await biometricLogin()
    } catch (err) {
      const message =
        err instanceof APIClientError ? err.message : 'Unable to sign in. Please use your password.'
      show(message, { type: 'error' })
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
          {isLoading ? 'Signing in…' : 'Sign in'}
        </QBText>
      </TouchableOpacity>

      {isEnabled && canUseBiometrics && (
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleBiometricLogin} activeOpacity={0.8}>
          <MaterialCommunityIcons
            name={biometricType === 'facial' ? 'face-recognition' : 'fingerprint'}
            size={18}
            color={tokens.color.brand.violet}
          />
          <QBText variant="labelSemibold" color="violet" style={styles.secondaryBtnText}>
            {biometricType === 'facial' ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}
          </QBText>
        </TouchableOpacity>
      )}

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
        <QBText variant="bodySm" color="muted">New here?{' '}</QBText>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity activeOpacity={0.7}>
            <QBText variant="labelSemibold" color="violet">Create an account</QBText>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  )

  return (
    <AuthShell
      title="Welcome back"
      sub="Sign in to keep your scores and streaks."
      footer={actions}
    >
      <View style={styles.fields}>
        <FormField<LoginInput>
          name="email"
          control={control}
          label="Email"
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
      </View>

      <View style={styles.metaRow}>
        <TouchableOpacity
          style={styles.rememberRow}
          onPress={() => setRememberMe((v) => !v)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && (
              <MaterialCommunityIcons name="check" size={11} color="#fff" />
            )}
          </View>
          <QBText variant="bodySm" color="soft">Remember me</QBText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} activeOpacity={0.7}>
          <QBText variant="labelSemibold" color="violet">Forgot password?</QBText>
        </TouchableOpacity>
      </View>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  fields: {
    gap: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: tokens.color.ink.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: tokens.color.brand.violet,
    borderColor: tokens.color.brand.violet,
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
  secondaryBtn: {
    height: 52,
    borderRadius: tokens.radius.md,
    borderWidth: 1.5,
    borderColor: tokens.color.ink.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
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
