import React from 'react'
import { Card as PaperCard } from 'react-native-paper'
import type { StyleProp, ViewStyle } from 'react-native'

export interface CardProps {
  children?: React.ReactNode
  /** Bold header line */
  title?: string
  /** Muted subtitle below the title */
  subtitle?: string
  /** Row of action elements (usually Buttons) anchored to the card bottom */
  actions?: React.ReactNode
  /** Makes the whole card tappable */
  onPress?: () => void
  /** MD3 elevation level (0–5) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
  style?: StyleProp<ViewStyle>
  contentStyle?: StyleProp<ViewStyle>
}

export function Card({
  children,
  title,
  subtitle,
  actions,
  onPress,
  elevation = 1,
  style,
  contentStyle,
}: CardProps) {
  return (
    <PaperCard elevation={elevation} onPress={onPress} style={style}>
      {(title ?? subtitle) ? (
        <PaperCard.Title
          title={title ?? ''}
          subtitle={subtitle}
          titleVariant="titleMedium"
          subtitleVariant="bodySmall"
        />
      ) : null}

      {children ? (
        <PaperCard.Content style={contentStyle}>{children}</PaperCard.Content>
      ) : null}

      {actions ? <PaperCard.Actions>{actions}</PaperCard.Actions> : null}
    </PaperCard>
  )
}

// Re-export sub-components for cases where callers need full control
Card.Title = PaperCard.Title
Card.Content = PaperCard.Content
Card.Cover = PaperCard.Cover
Card.Actions = PaperCard.Actions
