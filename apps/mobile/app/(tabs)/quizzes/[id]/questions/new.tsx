import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout'
import { IconButton } from '@/components/ui/IconButton'
import { QuestionEditorForm } from '@/components/question/QuestionEditorForm'
import { useCreateQuestion } from '@/hooks/useQuestions'
import { useSnackbar } from '@/components/ui/Snackbar'
import { APIClientError } from '@/core/api-client'
import { useAppTheme } from '@/theme'
import type { CreateQuestionInput } from '@/validation/question'

export default function CreateQuestionScreen() {
  const { id: quizId } = useLocalSearchParams<{ id: string }>()
  const createQuestion = useCreateQuestion(quizId!)
  const { show } = useSnackbar()
  const { colors } = useAppTheme()

  function handleSubmit(data: CreateQuestionInput) {
    createQuestion.mutate(data, {
      onSuccess: () => {
        show('Question added!', { type: 'success' })
        router.back()
      },
      onError: (err) => {
        const message =
          err instanceof APIClientError
            ? err.message
            : 'Failed to add question. Please try again.'
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
          Add Question
        </Text>
      </View>

      <QuestionEditorForm
        onSubmit={handleSubmit}
        isLoading={createQuestion.isPending}
        submitLabel="Add Question"
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
