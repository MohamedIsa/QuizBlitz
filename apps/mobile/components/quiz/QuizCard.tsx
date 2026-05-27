import { Image, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Card } from '@/components/ui/Card'
import { QuizStatusBadge } from './QuizStatusBadge'
import { useAppTheme } from '@/theme'
import { tokens } from '@/theme/tokens'
import type { Quiz } from '@/validation/quiz'

interface QuizCardProps {
  quiz: Quiz
  onPress: () => void
}

export function QuizCard({ quiz, onPress }: QuizCardProps) {
  const { colors } = useAppTheme()

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        {quiz.coverImageUrl ? (
          <Image
            source={{ uri: quiz.coverImageUrl }}
            style={[styles.thumbnail, { backgroundColor: colors.surfaceVariant }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: colors.primaryContainer }]} />
        )}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              variant="titleMedium"
              numberOfLines={1}
              style={[styles.title, { color: colors.onSurface }]}
            >
              {quiz.title}
            </Text>
            <QuizStatusBadge status={quiz.status} />
          </View>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.sm,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: tokens.font.uiSemibold,
  },
})
