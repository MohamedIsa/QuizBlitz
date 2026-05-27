import { router } from 'expo-router'
import { Screen } from '@/components/layout'
import { IconButton } from '@/components/ui/IconButton'
import { QuizEditorForm } from '@/components/quiz/QuizEditorForm'
import { useCreateQuiz } from '@/hooks/useQuizzes'
import { useSnackbar } from '@/components/ui/Snackbar'
import { APIClientError } from '@/core/api-client'
import { useAppTheme } from '@/theme'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import type { CreateQuizInput } from '@/validation/quiz'

export default function CreateQuizScreen() {
  const createQuiz = useCreateQuiz()
  const { show } = useSnackbar()
  const { colors } = useAppTheme()

  function handleSubmit(data: CreateQuizInput) {
    createQuiz.mutate(data, {
      onSuccess: (quiz) => {
        show('Quiz created!', { type: 'success' })
        router.replace({ pathname: '/(tabs)/quizzes/[id]/questions', params: { id: quiz.id } })
      },
      onError: (err) => {
        const message =
          err instanceof APIClientError ? err.message : 'Failed to create quiz. Please try again.'
        show(message, { type: 'error' })
      },
    })
  }

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text variant="headlineSmall" style={{ color: colors.onBackground, fontWeight: '700' }}>
          Create Quiz
        </Text>
      </View>

      <QuizEditorForm
        onSubmit={handleSubmit}
        isLoading={createQuiz.isPending}
        submitLabel="Create Quiz"
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
})
