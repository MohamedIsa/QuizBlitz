import { StyleSheet } from 'react-native'
import { Chip } from '@/components/ui/Chip'
import { tokens } from '@/theme/tokens'
import type { QuizStatus } from '@/validation/quiz'

interface QuizStatusBadgeProps {
  status: QuizStatus
}

const STATUS_CONFIG: Record<QuizStatus, { label: string; bg: string; text: string }> = {
  published: {
    label: 'Published',
    bg: tokens.color.semantic.correctSoft,
    text: tokens.color.semantic.correct,
  },
  draft: {
    label: 'Draft',
    bg: tokens.color.ink.surface3,
    text: tokens.color.ink.muted,
  },
}

export function QuizStatusBadge({ status }: QuizStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Chip
      label={config.label}
      style={[styles.chip, { backgroundColor: config.bg }]}
      textStyle={{ color: config.text }}
    />
  )
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: tokens.radius.pill,
  },
})
