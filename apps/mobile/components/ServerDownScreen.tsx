import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { QBText } from '@/components/ui'
import { tokens } from '@/theme/tokens'

interface Props {
  onRetry: () => void
  isRetrying: boolean
}

export function ServerDownScreen({ onRetry, isRetrying }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={52}
            color={tokens.color.brand.violet}
          />
        </View>

        <QBText variant="displaySm" style={styles.title}>
          We'll be right back
        </QBText>

        <QBText variant="body" color="muted" style={styles.message}>
          QuizBlitz is currently unreachable. Check your connection or try again in a moment.
        </QBText>
      </View>

      <View style={styles.actions}>
        {isRetrying ? (
          <ActivityIndicator size="large" color={tokens.color.brand.violet} />
        ) : (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
            <QBText variant="labelBold" color="onDark">Try again</QBText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.ink.surface,
    paddingHorizontal: 36,
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: tokens.color.ink.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    alignItems: 'center',
    paddingTop: 16,
  },
  retryBtn: {
    height: 52,
    width: '100%',
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.brand.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
