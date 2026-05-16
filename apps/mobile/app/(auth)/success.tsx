import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthShell } from '@/components/auth/AuthShell'
import { QBText } from '@/components/ui'
import { tokens } from '@/theme/tokens'

type SuccessContext = 'registered' | 'reset' | 'verified'

const COPY: Record<SuccessContext, { body: string; btnLabel: string; btnIcon: string; onPress: () => void }> = {
  registered: {
    body: "Your account's ready. Time to jump into a quiz.",
    btnLabel: 'Start playing',
    btnIcon: 'lightning-bolt',
    onPress: () => router.replace('/(tabs)'),
  },
  reset: {
    body: 'Your password has been updated. You can now sign in.',
    btnLabel: 'Sign in',
    btnIcon: 'login',
    onPress: () => router.replace('/(auth)/login'),
  },
  verified: {
    body: 'Your email has been confirmed. You are all set.',
    btnLabel: 'Sign in',
    btnIcon: 'login',
    onPress: () => router.replace('/(auth)/login'),
  },
}

export default function SuccessScreen() {
  const { context } = useLocalSearchParams<{ context: SuccessContext }>()
  const copy = COPY[context ?? 'registered'] ?? COPY.registered

  return (
    <AuthShell back={false}>
      <View style={styles.center}>
        <View style={styles.burst}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.ray,
                {
                  top: 122,
                  left: 138,
                  transform: [
                    { rotate: `${i * 45}deg` },
                    { translateY: -110 },
                  ],
                },
              ]}
            />
          ))}

          <View style={styles.halo}>
            <View style={styles.circle}>
              <MaterialCommunityIcons name="check" size={64} color="#fff" />
            </View>
          </View>
        </View>

        <QBText variant="displayLg" style={styles.heading}>You're all set!</QBText>
        <QBText variant="body" color="muted" style={styles.body}>{copy.body}</QBText>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={copy.onPress}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name={copy.btnIcon as never} size={16} color="#fff" />
        <QBText variant="labelBold" color="onDark">{copy.btnLabel}</QBText>
      </TouchableOpacity>
    </AuthShell>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: tokens.color.brand.violetSoft,
    opacity: 0.7,
  },
  halo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: tokens.color.semantic.correctSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: tokens.color.semantic.correct,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tokens.color.semantic.correct,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.34,
    shadowRadius: 30,
    elevation: 12,
  },
  heading: {
    marginTop: 32,
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    maxWidth: 280,
    textAlign: 'center',
  },
  primaryBtn: {
    height: 52,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brand.violet,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
})
