import { Text, type TextProps, StyleSheet } from 'react-native'
import { tokens } from '@/theme/tokens'

// ─── Variants ─────────────────────────────────────────────────────────────
// Each variant encodes font family + size + line-height + letter-spacing.
// Display variants use Bricolage Grotesque; ui variants use Inter.

export type QBTextVariant =
  // ── Display (Bricolage Grotesque Bold) ────────────────────────────────
  | 'displayXl'    // 40px  — screen titles, stage headings
  | 'displayLg'    // 36px  — success headings
  | 'displayMd'    // 32px  — auth shell titles
  | 'displaySm'    // 28px  — card headings
  | 'displayXs'    // 22px  — section headings
  // ── Body / UI (Inter) ─────────────────────────────────────────────────
  | 'bodyLg'       // 16px  Regular
  | 'body'         // 14px  Regular
  | 'bodySm'       // 13px  Regular  — subtitles, footer copy
  | 'bodyXs'       // 12px  Regular  — helper text, labels
  | 'bodySmMedium' // 13px  Medium
  | 'bodyMedium'   // 14px  Medium
  | 'labelSemibold'// 13px  SemiBold — links, chips
  | 'labelBold'    // 15px  Bold     — button text, primary actions
  | 'caption'      // 11px  Regular  — timestamps, badges

export type QBTextColor =
  | 'ink'      // default body colour
  | 'soft'     // secondary body colour
  | 'muted'    // tertiary / placeholder
  | 'violet'   // brand accent
  | 'error'    // validation errors
  | 'correct'  // success states
  | 'onDark'   // white — for use on dark/violet backgrounds

const VARIANT_STYLES: Record<QBTextVariant, object> = StyleSheet.create({
  displayXl:     { fontFamily: tokens.font.display, fontSize: 40, letterSpacing: -1.5, lineHeight: 44 },
  displayLg:     { fontFamily: tokens.font.display, fontSize: 36, letterSpacing: -1.2, lineHeight: 40 },
  displayMd:     { fontFamily: tokens.font.display, fontSize: 32, letterSpacing: -1,   lineHeight: 34 },
  displaySm:     { fontFamily: tokens.font.display, fontSize: 28, letterSpacing: -0.8, lineHeight: 30 },
  displayXs:     { fontFamily: tokens.font.display, fontSize: 22, letterSpacing: -0.5, lineHeight: 26 },
  bodyLg:        { fontFamily: tokens.font.ui,           fontSize: 16, lineHeight: 24 },
  body:          { fontFamily: tokens.font.ui,           fontSize: 14, lineHeight: 21 },
  bodySm:        { fontFamily: tokens.font.ui,           fontSize: 13, lineHeight: 19 },
  bodyXs:        { fontFamily: tokens.font.ui,           fontSize: 12, lineHeight: 18 },
  bodySmMedium:  { fontFamily: tokens.font.uiMedium,     fontSize: 13, lineHeight: 19 },
  bodyMedium:    { fontFamily: tokens.font.uiMedium,     fontSize: 14, lineHeight: 21 },
  labelSemibold: { fontFamily: tokens.font.uiSemibold,   fontSize: 13, lineHeight: 19 },
  labelBold:     { fontFamily: tokens.font.uiBold,       fontSize: 15, lineHeight: 21 },
  caption:       { fontFamily: tokens.font.ui,           fontSize: 11, lineHeight: 16 },
})

const COLOR_MAP: Record<QBTextColor, string> = {
  ink:     tokens.color.ink.ink,
  soft:    tokens.color.ink.inkSoft,
  muted:   tokens.color.ink.muted,
  violet:  tokens.color.brand.violet,
  error:   tokens.color.semantic.wrong,
  correct: tokens.color.semantic.correct,
  onDark:  '#ffffff',
}

// ─── Component ────────────────────────────────────────────────────────────

export interface QBTextProps extends TextProps {
  variant?: QBTextVariant
  color?: QBTextColor
}

export function QBText({
  variant = 'body',
  color = 'ink',
  style,
  ...props
}: QBTextProps) {
  return (
    <Text
      style={[
        VARIANT_STYLES[variant],
        { color: COLOR_MAP[color] },
        style,
      ]}
      {...props}
    />
  )
}
