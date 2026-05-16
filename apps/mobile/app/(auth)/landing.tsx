import { View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { QBText } from '@/components/ui'
import { tokens } from '@/theme/tokens'

export default function LandingScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar barStyle="light-content" backgroundColor={tokens.color.stage.night} />

      <View style={styles.hero}>
        <View style={styles.logoMark}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={40}
              color={tokens.color.brand.yellow}
            />
          </View>
        </View>

        <QBText variant="displayXl" color="onDark" style={styles.wordmark}>QuizBlitz</QBText>
        <QBText variant="body" style={styles.tagline}>
          {'Real-time quizzes.\nAnywhere, with anyone.'}
        </QBText>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="lightning-bolt" size={18} color={tokens.color.ink.ink} />
          <QBText variant="labelBold" style={styles.joinBtnText}>Join a Quiz</QBText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hostBtn}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <QBText variant="labelSemibold" style={styles.hostBtnText}>Sign in to host</QBText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.stage.night,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: tokens.color.brand.violet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tokens.color.brand.violet,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 14,
  },
  wordmark: {
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  joinBtn: {
    height: 56,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brand.yellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: tokens.color.brand.yellow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  joinBtnText: {
    fontSize: 16,
    color: tokens.color.ink.ink,
  },
  hostBtn: {
    height: 56,
    borderRadius: tokens.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBtnText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
})
