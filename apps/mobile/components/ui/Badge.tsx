import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Badge as PaperBadge } from 'react-native-paper'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'

export interface BadgeProps {
  /** The count or short label shown inside the badge */
  value?: number | string
  /** Max value before the badge shows e.g. "99+" */
  max?: number
  visible?: boolean
  size?: number
  style?: StyleProp<TextStyle>
}

export interface BadgeAnchorProps {
  /** The element the badge is anchored to (e.g. an icon) */
  children: React.ReactNode
  badge: Omit<BadgeProps, 'style'> & { style?: StyleProp<TextStyle> }
  style?: StyleProp<ViewStyle>
}

/** Standalone badge (notification dot / count pill). */
export function Badge({ value, max = 99, visible = true, size = 20, style }: BadgeProps) {
  const display =
    typeof value === 'number' && value > max ? `${max}+` : value

  return (
    <PaperBadge visible={visible} size={size} style={style}>
      {display}
    </PaperBadge>
  )
}

/** Badge anchored to a child element (icon, avatar, etc.). */
export function BadgeAnchor({ children, badge, style }: BadgeAnchorProps) {
  return (
    <View style={[styles.anchor, style]}>
      {children}
      <Badge {...badge} style={[styles.anchored, badge.style]} />
    </View>
  )
}

const styles = StyleSheet.create({
  anchor: {
    alignSelf: 'flex-start',
  },
  anchored: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
})
