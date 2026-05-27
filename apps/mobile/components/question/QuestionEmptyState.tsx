import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Button } from '@/components/ui/Button'
import { useAppTheme } from '@/theme'

interface QuestionEmptyStateProps {
  onAddPress: () => void
}

export function QuestionEmptyState({ onAddPress }: QuestionEmptyStateProps) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="help-circle-outline"
        size={64}
        color={colors.onSurfaceVariant}
      />
      <Text variant="headlineSmall" style={{ color: colors.onSurface, textAlign: 'center' }}>
        No questions yet
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}
      >
        Add your first question to start building this quiz.
      </Text>
      <Button mode="contained" onPress={onAddPress} style={styles.button}>
        Add your first question
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
