import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Button } from '@/components/ui/Button'
import { useAppTheme } from '@/theme'

interface QuizEmptyStateProps {
  onCreatePress: () => void
}

export function QuizEmptyState({ onCreatePress }: QuizEmptyStateProps) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="clipboard-text-outline"
        size={64}
        color={colors.onSurfaceVariant}
      />
      <Text variant="headlineSmall" style={{ color: colors.onSurface, textAlign: 'center' }}>
        No quizzes yet
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}
      >
        Create your first quiz and start adding questions.
      </Text>
      <Button mode="contained" onPress={onCreatePress} style={styles.button}>
        Create your first quiz
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  button: {
    marginTop: 8,
  },
})
