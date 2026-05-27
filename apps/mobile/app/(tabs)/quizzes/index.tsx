import { FlatList, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { router } from 'expo-router'
import { Screen } from '@/components/layout'
import { FAB } from '@/components/ui/FAB'
import { QuizCard } from '@/components/quiz/QuizCard'
import { QuizEmptyState } from '@/components/quiz/QuizEmptyState'
import { useQuizzes } from '@/hooks/useQuizzes'
import { useAppTheme } from '@/theme'
import type { Quiz } from '@/validation/quiz'

export default function QuizListScreen() {
  const { data: quizzes, isLoading, isFetching, error, refetch } = useQuizzes()
  const { colors } = useAppTheme()

  function handleQuizPress(quiz: Quiz) {
    router.push({ pathname: '/(tabs)/quizzes/[id]/edit', params: { id: quiz.id } })
  }

  function handleCreatePress() {
    router.push('/(tabs)/quizzes/new')
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
          Failed to load quizzes. Pull down to retry.
        </Text>
      </Screen>
    )
  }

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: colors.onBackground, fontWeight: '700' }}>
          My Quizzes
        </Text>
      </View>
      <FlatList
        data={quizzes}
        keyExtractor={(q) => q.id}
        renderItem={({ item }) => (
          <QuizCard quiz={item} onPress={() => handleQuizPress(item)} />
        )}
        onRefresh={refetch}
        refreshing={isFetching && !isLoading}
        ListEmptyComponent={<QuizEmptyState onCreatePress={handleCreatePress} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      {(quizzes?.length ?? 0) > 0 && (
        <FAB icon="plus" anchored onPress={handleCreatePress} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  separator: {
    height: 12,
  },
})
