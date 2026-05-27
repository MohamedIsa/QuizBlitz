import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { useAppTheme } from '@/theme'
import { tokens } from '@/theme/tokens'
import type { Question } from '@/validation/question'

interface QuestionCardProps {
  question: Question
  index: number
  onPress: () => void
  drag?: () => void
  isActive?: boolean
}

export function QuestionCard({ question, index, onPress, drag, isActive }: QuestionCardProps) {
  const { colors } = useAppTheme()
  const optionPreview = question.options
    .map((o, i) => `${String.fromCharCode(65 + i)}. ${o.text}`)
    .join('  ')

  return (
    <Card
      onPress={onPress}
      elevation={isActive ? 3 : 1}
      style={[styles.card, isActive && styles.activeCard]}
    >
      <View style={styles.row}>
        {drag && (
          <IconButton
            icon="drag-horizontal-variant"
            size={20}
            onPress={drag}
            onLongPress={drag}
            accessibilityLabel="Drag to reorder"
            haptic={false}
          />
        )}
        <View style={styles.content}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={{ color: colors.onSurface, fontFamily: tokens.font.uiSemibold }}
          >
            {index + 1}. {question.text}
          </Text>
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{ color: colors.onSurfaceVariant }}
          >
            {optionPreview}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {question.timeLimit}s
          </Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius.md,
    ...tokens.shadow.card,
  },
  activeCard: {
    ...tokens.shadow.lift,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    flex: 1,
    gap: 4,
  },
})
