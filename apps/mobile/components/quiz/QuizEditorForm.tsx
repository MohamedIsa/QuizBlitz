import { StyleSheet, View } from 'react-native'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { ImagePickerButton } from '@/components/common/ImagePickerButton'
import { createQuizSchema } from '@/validation/quiz'
import type { CreateQuizInput } from '@/validation/quiz'
import { useAppTheme } from '@/theme'
import { tokens } from '@/theme/tokens'

interface QuizEditorFormProps {
  defaultValues?: Partial<CreateQuizInput>
  onSubmit: (data: CreateQuizInput) => void
  isLoading: boolean
  submitLabel: string
}

export function QuizEditorForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel,
}: QuizEditorFormProps) {
  const { colors } = useAppTheme()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateQuizInput>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: '',
      description: '',
      coverImageUrl: null,
      isPublished: false,
      ...defaultValues,
    },
  })

  const isPublished = watch('isPublished')

  return (
    <View style={styles.container}>
      <ImagePickerButton
        currentUrl={watch('coverImageUrl')}
        onUpload={(url) => setValue('coverImageUrl', url)}
        aspectRatio={[16, 9]}
        label="Add cover image"
      />

      <FormField<CreateQuizInput>
        name="title"
        control={control}
        label="Title"
        error={errors.title}
        placeholder="Enter quiz title"
        returnKeyType="next"
      />

      <FormField<CreateQuizInput>
        name="description"
        control={control}
        label="Description (optional)"
        error={errors.description}
        placeholder="What is this quiz about?"
        multiline
        numberOfLines={3}
      />

      <View style={styles.statusRow}>
        <Chip
          label="Draft"
          selected={!isPublished}
          onPress={() => setValue('isPublished', false)}
          style={!isPublished ? { backgroundColor: colors.primaryContainer } : undefined}
        />
        <Chip
          label="Published"
          selected={isPublished}
          onPress={() => setValue('isPublished', true)}
          style={
            isPublished
              ? { backgroundColor: tokens.color.semantic.correctSoft }
              : undefined
          }
          textStyle={isPublished ? { color: tokens.color.semantic.correct } : undefined}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        style={styles.submitButton}
      >
        {submitLabel}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: tokens.radius.md,
  },
})
