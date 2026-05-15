import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as PaperButton } from 'react-native-paper'
import type { ButtonProps as PaperButtonProps } from 'react-native-paper'
import * as Haptics from 'expo-haptics'

export interface ButtonProps extends Omit<PaperButtonProps, 'children'> {
  children: React.ReactNode
  /** Stretches the button to fill its parent container */
  fullWidth?: boolean
  /** Trigger a light haptic tap on press (default: true) */
  haptic?: boolean
}

export function Button({
  children,
  fullWidth = false,
  haptic = true,
  mode = 'contained',
  onPress,
  style,
  contentStyle,
  ...props
}: ButtonProps) {
  const handlePress: ButtonProps['onPress'] = async (e) => {
    if (haptic) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.(e)
  }

  return (
    <PaperButton
      mode={mode}
      onPress={handlePress}
      style={[fullWidth && styles.fullWidth, style]}
      contentStyle={[fullWidth && styles.fullWidthContent, contentStyle]}
      {...props}
    >
      {children}
    </PaperButton>
  )
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  fullWidthContent: {
    width: '100%',
  },
})
