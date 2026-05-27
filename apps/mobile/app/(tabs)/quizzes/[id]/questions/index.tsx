import { StyleSheet, View } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist'
import { Screen } from '@/components/layout'
import { FAB } from '@/components/ui/FAB'
import { IconButton } from '@/components/ui/IconButton'
import { QuestionCard } from '@/components/question/QuestionCard'
import { QuestionEmptyState } from '@/components/question/QuestionEmptyState'
import { useQuestions, useReorderQuestions } from '@/hooks/useQuestions'
import { useAppTheme } from '@/theme'
import type { Question } from '@/validation/question'

export default function QuestionListScreen() {
  const { id: quizId } = useLocalSearchParams<{ id: string }>()
  const { data: questions, isLoading, error } = useQuestions(quizId!)
  const reorder = useReorderQuestions(quizId!)
  const { colors } = useAppTheme()

  function handleQuestionPress(question: Question) {
    router.push({
      pathname: '/(tabs)/quizzes/[id]/questions/[qid]/edit',
      params: { id: quizId!, qid: question.id },
    })
  }

  function handleAddQuestion() {
    router.push({ pathname: '/(tabs)/quizzes/[id]/questions/new', params: { id: quizId! } })
  }

  function handleDragEnd(data: Question[]) {
    const items = data.map((q, i) => ({ id: q.id, orderIndex: i }))
    reorder.mutate(items)
  }

  function renderItem({ item, drag, isActive, getIndex }: RenderItemParams<Question>) {
    const index = getIndex() ?? 0
    return (
      <QuestionCard
        question={item}
        index={index}
        onPress={() => handleQuestionPress(item)}
        drag={drag}
        isActive={isActive}
      />
    )
  }

  if (isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen centered>
        <Text variant="bodyLarge" style={{ color: colors.error, textAlign: 'center' }}>
          Failed to load questions.
        </Text>
      </Screen>
    )
  }

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text variant="headlineSmall" style={{ color: colors.onBackground, fontWeight: '700' }}>
          Questions
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {questions?.length ?? 0} total
        </Text>
      </View>

      {questions?.length === 0 ? (
        <QuestionEmptyState onAddPress={handleAddQuestion} />
      ) : (
        <View style={styles.flex}>
          <DraggableFlatList
            data={questions ?? []}
            keyExtractor={(q) => q.id}
            renderItem={renderItem}
            onDragEnd={({ data }) => handleDragEnd(data)}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      <FAB icon="plus" anchored onPress={handleAddQuestion} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  separator: {
    height: 10,
  },
})
