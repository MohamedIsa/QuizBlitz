import { MD3LightTheme, MD3DarkTheme, configureFonts, useTheme } from 'react-native-paper';
import { tokens } from './tokens';

const fontConfig = {
  displayLarge:   { fontFamily: tokens.font.display,    fontSize: tokens.text.displayLg, lineHeight: 48, letterSpacing: -0.5 },
  displayMedium:  { fontFamily: tokens.font.display,    fontSize: tokens.text.displayMd, lineHeight: 36, letterSpacing: -0.5 },
  displaySmall:   { fontFamily: tokens.font.display,    fontSize: tokens.text.displaySm, lineHeight: 30, letterSpacing: -0.3 },
  headlineLarge:  { fontFamily: tokens.font.display,    fontSize: tokens.text.displayMd, lineHeight: 36 },
  headlineMedium: { fontFamily: tokens.font.display,    fontSize: tokens.text.displaySm, lineHeight: 30 },
  headlineSmall:  { fontFamily: tokens.font.display,    fontSize: 20,                    lineHeight: 26 },
  bodyLarge:      { fontFamily: tokens.font.ui,         fontSize: tokens.text.uiLg,      lineHeight: 24 },
  bodyMedium:     { fontFamily: tokens.font.ui,         fontSize: tokens.text.uiMd,      lineHeight: 20 },
  bodySmall:      { fontFamily: tokens.font.ui,         fontSize: tokens.text.uiSm,      lineHeight: 16 },
  labelLarge:     { fontFamily: tokens.font.uiSemibold, fontSize: tokens.text.uiLg,      lineHeight: 24 },
  labelMedium:    { fontFamily: tokens.font.uiSemibold, fontSize: tokens.text.uiMd,      lineHeight: 20 },
  labelSmall:     { fontFamily: tokens.font.uiSemibold, fontSize: tokens.text.uiSm,      lineHeight: 16 },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:            tokens.color.brand.violet,
    primaryContainer:   tokens.color.brand.violetSoft,
    onPrimary:          '#FFFFFF',
    onPrimaryContainer: tokens.color.brand.violetDeep,
    secondary:          tokens.color.brand.yellow,
    onSecondary:        tokens.color.ink.ink,
    secondaryContainer: tokens.color.brand.yellowDeep,
    background:         tokens.color.ink.surface2,
    onBackground:       tokens.color.ink.ink,
    surface:            tokens.color.ink.surface,
    onSurface:          tokens.color.ink.ink,
    surfaceVariant:     tokens.color.ink.surface3,
    onSurfaceVariant:   tokens.color.ink.muted,
    outline:            tokens.color.ink.border,
    outlineVariant:     tokens.color.ink.borderSoft,
    error:              tokens.color.semantic.wrong,
    errorContainer:     tokens.color.semantic.wrongSoft,
    onError:            '#FFFFFF',
  },
  fonts: configureFonts({ config: fontConfig }),
  tokens,
};

// Kept for _layout.tsx import — never rendered (userSwitchable: false)
export const darkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: tokens.color.brand.violet },
  tokens,
};

export type AppTheme = typeof lightTheme;

export const THEME_CONFIG = {
  userSwitchable: false,
  fixed: 'light' as const,
} as const;

export const useAppTheme = () => useTheme<AppTheme>();
