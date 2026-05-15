import React from 'react'
import { Chip as PaperChip } from 'react-native-paper'
import type { ChipProps as PaperChipProps } from 'react-native-paper'

export interface ChipProps extends Omit<PaperChipProps, 'children'> {
  label: string
}

/** Compact tag or filter pill. Tappable when `onPress` is provided. */
export function Chip({ label, compact = true, ...props }: ChipProps) {
  return (
    <PaperChip compact={compact} {...props}>
      {label}
    </PaperChip>
  )
}
