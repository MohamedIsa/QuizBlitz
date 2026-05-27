import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/forms'
import { Button } from '@/components/ui/Button'
import { ImagePickerButton } from '@/components/common/ImagePickerButton'
import { OptionInput } from './OptionInput'
import { TimeLimitSelector } from './TimeLimitSelector'
import { createQuestionSchema, MAX_OPTIONS, MIN_OPTIONS } from '@/validation/question'
import type { CreateQuestionInput } from '@/validation/question'
import { useAppTheme } from '@/theme'
import { tokens } from '@/theme/tokens'

interface QuestionEditorFormProps {
  defaultValues?: Partial<CreateQuestionInput>
  onSubmit: (data: CreateQuestionInput) => void
  isLoading: boolean
  submitLabel: string
}

export function QuestionEditorForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel,
}: QuestionEditorFormProps) {
  const { colors } = useAppTheme()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      text: '',
      options: [{ text: '' }, { text: '' }],
      correctOptionIndex: 0,
      timeLimit: 30,
      imageUrl: null,
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'options' })

  const correctOptionIndex = watch('correctOptionIndex')
  const timeLimit = watch('timeLimit')

  function handleRemoveOption(index: number) {
    remove(index)
    if (correctOptionIndex === index) {
      setValue('correctOptionIndex', 0)
    } else if (correctOptionIndex > index) {
      setValue('correctOptionIndex', correctOptionIndex - 1)
    }
  }

  function handleAddOption() {
    append({ text: '' })
  }

  return (
    <View style={styles.container}>
      <FormField<CreateQuestionInput>
        name="text"
        control={control}
        label="Question"
        error={errors.text}
        placeholder="Enter your question"
        multiline
        numberOfLines={3}
      />

      <ImagePickerButton
        currentUrl={watch('imageUrl')}
        onUpload={(url) => setValue('imageUrl', url)}
        aspectRatio={[4, 3]}
        label="Add question image (optional)"
      />

      <View style={styles.optionsSection}>
        <Text variant="labelLarge" style={{ color: colors.onSurface }}>
          Answer Options
        </Text>
        {errors.correctOptionIndex && (
          <Text variant="bodySmall" style={{ color: colors.error }}>
            {errors.correctOptionIndex.message}
          </Text>
        )}

        {fields.map((field, index) => (
          <OptionInput
            key={field.id}
            index={index}
            control={control}
            isCorrect={correctOptionIndex === index}
            onSelectCorrect={() => setValue('correctOptionIndex', index)}
            onRemove={fields.length > MIN_OPTIONS ? () => handleRemoveOption(index) : undefined}
            errorText={errors.options?.[index]?.text?.message}
          />
        ))}

        {fields.length < MAX_OPTIONS && (
          <Button mode="outlined" icon="plus" onPress={handleAddOption} style={styles.addButton}>
            Add Option
          </Button>
        )}
      </View>

      <TimeLimitSelector
        value={timeLimit}
        onChange={(v) => setValue('timeLimit', v)}
      />

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
  optionsSection: {
    gap: 10,
  },
  addButton: {
    borderRadius: tokens.radius.md,
    borderStyle: 'dashed',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: tokens.radius.md,
  },
})
