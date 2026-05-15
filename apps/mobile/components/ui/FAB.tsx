import React from 'react'
import { StyleSheet } from 'react-native'
import { FAB as PaperFAB } from 'react-native-paper'
import type { FABProps as PaperFABProps } from 'react-native-paper'
import type { StyleProp, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'

export interface FABProps extends Omit<PaperFABProps, 'icon'> {
  /** MaterialCommunityIcons icon name */
  icon: string
  /** Anchors the FAB to the bottom-right corner of its positioned parent */
  anchored?: boolean
  haptic?: boolean
  style?: StyleProp<ViewStyle>
}

export function FAB({ icon, anchored = false, haptic = true, onPress, style, ...props }: FABProps) {
  const handlePress: FABProps['onPress'] = async (e) => {
    if (haptic) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress?.(e)
  }

  return (
    <PaperFAB
      icon={icon}
      onPress={handlePress}
      style={[anchored && styles.anchored, style]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  anchored: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
})
