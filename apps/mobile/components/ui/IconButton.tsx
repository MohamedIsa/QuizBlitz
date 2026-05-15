import React from 'react'
import { IconButton as PaperIconButton } from 'react-native-paper'
import type { IconButtonProps as PaperIconButtonProps } from 'react-native-paper'
import * as Haptics from 'expo-haptics'

export interface IconButtonProps extends PaperIconButtonProps {
  haptic?: boolean
  // Required — icon-only buttons have no visible text, so a screen-reader label
  // is mandatory for VoiceOver/TalkBack to announce anything useful.
  accessibilityLabel: string
}

export function IconButton({ haptic = true, onPress, ...props }: IconButtonProps) {
  const handlePress: IconButtonProps['onPress'] = async (e) => {
    if (haptic) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.(e)
  }

  return <PaperIconButton onPress={handlePress} {...props} />
}
