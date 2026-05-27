import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { TextInput } from '@/components/ui/TextInput'
import { IconButton } from '@/components/ui/IconButton'
import { useAppTheme } from '@/theme'
import { tokens } from '@/theme/tokens'
import type { CreateQuestionInput } from '@/validation/question'

interface OptionInputProps {
  index: number
  control: Control<CreateQuestionInput>
  isCorrect: boolean
  onSelectCorrect: () => void
  onRemove?: () => void
  errorText?: string
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

const QUADRANT_COLORS = [
  tokens.color.quadrant.q1,
  tokens.color.quadrant.q2,
  tokens.color.quadrant.q3,
  tokens.color.quadrant.q4,
] as const

export function OptionInput({
  index,
  control,
  isCorrect,
  onSelectCorrect,
  onRemove,
  errorText,
}: OptionInputProps) {
  const { colors } = useAppTheme()
  const label = OPTION_LABELS[index]
  const quadrantColor = QUADRANT_COLORS[index]

  return (
    <Pressable onPress={onSelectCorrect}>
      <View
        style={[
          styles.container,
          isCorrect && styles.correctContainer,
          isCorrect && { borderColor: tokens.color.semantic.correct },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: quadrantColor }]}>
          <Text variant="labelLarge" style={[styles.badgeText, { color: colors.onPrimary }]}>
            {label}
          </Text>
        </View>

        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            name={`options.${index}.text`}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={`Option ${label}`}
                errorText={errorText}
                mode="outlined"
                dense
              />
            )}
          />
        </View>

        {isCorrect && (
          <View style={styles.checkIcon}>
            <Text style={[styles.checkText, { color: colors.onPrimary }]}>✓</Text>
          </View>
        )}

        {onRemove && (
          <IconButton
            icon="trash-can-outline"
            size={20}
            onPress={onRemove}
            accessibilityLabel={`Remove option ${label}`}
          />
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderWidth: 1.5,
    borderColor: tokens.color.ink.border,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.color.ink.surface,
  },
  correctContainer: {
    borderWidth: 2,
    backgroundColor: tokens.color.semantic.correctSoft,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: tokens.font.uiBold,
  },
  inputWrapper: {
    flex: 1,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.semantic.correct,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 14,
    fontFamily: tokens.font.uiBold,
  },
})
