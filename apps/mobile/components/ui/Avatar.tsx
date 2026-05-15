import React from 'react'
import { View } from 'react-native'
import { Avatar as PaperAvatar } from 'react-native-paper'
import type { StyleProp, ViewStyle } from 'react-native'

interface AvatarBase {
  size?: number
  style?: StyleProp<ViewStyle>
  // Screen-reader label. For the Text variant this defaults to the initials
  // (e.g. "Avatar, JD"). Image and icon variants should pass an explicit label.
  accessibilityLabel?: string
}

type AvatarProps =
  | (AvatarBase & { /** 1–2 character initials */ label: string; source?: never })
  | (AvatarBase & { /** URI or require'd image */ source: { uri: string } | number; label?: never })
  | (AvatarBase & {
      /** MaterialCommunityIcons icon name */ icon: string
      label?: never
      source?: never
    })

export function Avatar(props: AvatarProps) {
  const { size = 40, style, accessibilityLabel } = props

  if ('source' in props && props.source != null) {
    const src =
      typeof props.source === 'number'
        ? props.source
        : { uri: (props.source as { uri: string }).uri }
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel ?? 'Avatar'}
        accessibilityRole="image"
      >
        <PaperAvatar.Image size={size} source={src} style={style} />
      </View>
    )
  }

  if ('icon' in props && props.icon) {
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel ?? `Avatar, ${props.icon}`}
        accessibilityRole="image"
      >
        <PaperAvatar.Icon size={size} icon={props.icon} style={style} />
      </View>
    )
  }

  const label = 'label' in props && props.label ? props.label.slice(0, 2).toUpperCase() : '?'
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? `Avatar, ${label}`}
      accessibilityRole="image"
    >
      <PaperAvatar.Text size={size} label={label} style={style} />
    </View>
  )
}
