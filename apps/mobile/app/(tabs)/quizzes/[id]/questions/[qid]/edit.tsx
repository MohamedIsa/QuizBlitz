import { Alert, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { QuestionEditorForm } from '@/components/question/QuestionEditorForm'
import { useQuestion, useUpdateQuestion, useDeleteQuestion } from '@/hooks/useQuestions'
import { useSnackbar } from '@/components/ui/Snackbar'
import { APIClientError } from '@/core/api-client'
import { useAppTheme } from '@/theme'
import type { CreateQuestionInput } from '@/validation/question'

export default function EditQuestionScreen() {
  const { id: quizId, qid: questionId } = useLocalSearchParams<{ id: string; qid: string }>()
  const { data: question, isLoading, error } = useQuestion(quizId!, questionId!)
  const updateQuestion = useUpdateQuestion(quizId!, questionId!)
  const deleteQuestion = useDeleteQuestion(quizId!)
  const { show } = useSnackbar()
  const { colors } = useAppTheme()

  function handleSubmit(data: CreateQuestionInput) {
    updateQuestion.mutate(data, {
      onSuccess: () => {
        show('Question updated!', { type: 'success' })
        router.back()
      },
      onError: (err) => {
        const message =
          err instanceof APIClientError
            ? err.message
            : 'Failed to update question. Please try again.'
        show(message, { type: 'error' })
      },
    })
  }

  function handleDelete() {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteQuestion.mutate(questionId!, {
              onSuccess: () => {
                show('Question deleted.', { type: 'info' })
                router.back()
              },
              onError: (err) => {
                const message =
                  err instanceof APIClientError
                    ? err.message
                    : 'Failed to delete question. Please try again.'
                show(message, { type: 'error' })
              },
            })
          },
        },
      ],
    )
  }

  if (isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  if (error || !question) {
    return (
      <Screen centered>
        <Text variant="bodyLarge" style={{ color: colors.error, textAlign: 'center' }}>
          Failed to load question.
        </Text>
        <Button mode="text" onPress={() => router.back()}>
          Go back
        </Button>
      </Screen>
    )
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
          Edit Question
        </Text>
      </View>

      <QuestionEditorForm
        defaultValues={{
          text: question.text,
          options: question.options.map((o) => ({ text: o.text })),
          correctOptionIndex: question.correctOptionIndex,
          timeLimit: question.timeLimit,
          imageUrl: question.imageUrl,
        }}
        onSubmit={handleSubmit}
        isLoading={updateQuestion.isPending}
        submitLabel="Save Changes"
      />

      <Button
        mode="text"
        icon="delete-outline"
        onPress={handleDelete}
        loading={deleteQuestion.isPending}
        disabled={deleteQuestion.isPending}
        textColor={colors.error}
        style={styles.deleteButton}
      >
        Delete Question
      </Button>
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
  deleteButton: {
    marginTop: 8,
  },
})
