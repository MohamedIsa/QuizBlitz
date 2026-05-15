import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Divider as PaperDivider, Text } from 'react-native-paper'
import type { StyleProp, ViewStyle } from 'react-native'

export interface DividerProps {
  /** When provided, renders a centred label between two lines */
  label?: string
  bold?: boolean
  horizontalInset?: boolean
  /** Vertical space above and below the divider */
  spacing?: number
  style?: StyleProp<ViewStyle>
}

export function Divider({ label, bold, horizontalInset, spacing = 0, style }: DividerProps) {
  if (label) {
    return (
      <View style={[styles.labeled, spacing ? { marginVertical: spacing } : null, style]}>
        <PaperDivider style={styles.line} />
        <Text variant="labelSmall" style={styles.labelText}>
          {label}
        </Text>
        <PaperDivider style={styles.line} />
      </View>
    )
  }

  return (
    <PaperDivider
      bold={bold}
      horizontalInset={horizontalInset}
      style={[spacing ? { marginVertical: spacing } : null, style]}
    />
  )
}

const styles = StyleSheet.create({
  labeled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  line: {
    flex: 1,
  },
  labelText: {
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
