import { Alert, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { Screen } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { QuizEditorForm } from '@/components/quiz/QuizEditorForm'
import { useQuiz, useUpdateQuiz, useDeleteQuiz } from '@/hooks/useQuizzes'
import { useSnackbar } from '@/components/ui/Snackbar'
import { APIClientError } from '@/core/api-client'
import { useAppTheme } from '@/theme'
import { tokens } from '@/theme/tokens'
import type { CreateQuizInput } from '@/validation/quiz'

export default function EditQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: quiz, isLoading, error } = useQuiz(id!)
  const updateQuiz = useUpdateQuiz(id!)
  const deleteQuiz = useDeleteQuiz()
  const { show } = useSnackbar()
  const { colors } = useAppTheme()

  function handleSubmit(data: CreateQuizInput) {
    updateQuiz.mutate(data, {
      onSuccess: () => {
        show('Quiz updated!', { type: 'success' })
        router.back()
      },
      onError: (err) => {
        const message =
          err instanceof APIClientError ? err.message : 'Failed to update quiz. Please try again.'
        show(message, { type: 'error' })
      },
    })
  }

  function handleDelete() {
    Alert.alert('Delete Quiz', 'Are you sure you want to delete this quiz? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteQuiz.mutate(id!, {
            onSuccess: () => {
              show('Quiz deleted.', { type: 'info' })
              router.replace('/(tabs)/quizzes' as const)
            },
            onError: (err) => {
              const message =
                err instanceof APIClientError
                  ? err.message
                  : 'Failed to delete quiz. Please try again.'
              show(message, { type: 'error' })
            },
          })
        },
      },
    ])
  }

  function handleManageQuestions() {
    router.push({ pathname: '/(tabs)/quizzes/[id]/questions', params: { id: id! } })
  }

  if (isLoading) {
    return (
      <Screen centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    )
  }

  if (error || !quiz) {
    return (
      <Screen centered>
        <Text variant="bodyLarge" style={{ color: colors.error, textAlign: 'center' }}>
          Failed to load quiz.
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
        <Text
          variant="headlineSmall"
          style={{ color: colors.onBackground, fontWeight: '700', flex: 1 }}
          numberOfLines={1}
        >
          Edit Quiz
        </Text>
      </View>

      <QuizEditorForm
        defaultValues={{
          title: quiz.title,
          description: quiz.description ?? '',
          coverImageUrl: quiz.coverImageUrl,
          isPublished: quiz.status === 'published',
        }}
        onSubmit={handleSubmit}
        isLoading={updateQuiz.isPending}
        submitLabel="Save Changes"
      />

      <Button
        mode="outlined"
        icon="format-list-numbered"
        onPress={handleManageQuestions}
        fullWidth
        style={styles.questionsButton}
      >
        Manage Questions ({quiz.questionCount})
      </Button>

      <Button
        mode="text"
        icon="delete-outline"
        onPress={handleDelete}
        loading={deleteQuiz.isPending}
        disabled={deleteQuiz.isPending}
        textColor={colors.error}
        style={styles.deleteButton}
      >
        Delete Quiz
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
  questionsButton: {
    marginTop: 16,
    borderRadius: tokens.radius.md,
  },
  deleteButton: {
    marginTop: 8,
  },
})
