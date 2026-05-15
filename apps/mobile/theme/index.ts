import { MD3LightTheme, MD3DarkTheme, useTheme } from 'react-native-paper'

// ─── Light palette ────────────────────────────────────────────────────────
export const palette = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryContainer: '#E0E7FF',
  onPrimaryContainer: '#312E81',
  secondary: '#EC4899',
  secondaryContainer: '#FCE7F3',
  onSecondaryContainer: '#831843',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  error: '#EF4444',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#7F1D1D',
  success: '#10B981',
  successContainer: '#D1FAE5',
  warning: '#F59E0B',
  warningContainer: '#FEF3C7',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#111827',
  onSurface: '#111827',
  onSurfaceVariant: '#6B7280',
  onError: '#FFFFFF',
  outline: '#E5E7EB',
  outlineVariant: '#D1D5DB',
} as const

// ─── Dark palette ─────────────────────────────────────────────────────────
export const darkPalette = {
  primary: '#818CF8', // indigo-400
  primaryDark: '#6366F1', // indigo-500
  primaryContainer: '#3730A3', // indigo-800
  onPrimaryContainer: '#C7D2FE', // indigo-200
  secondary: '#F472B6', // pink-400
  secondaryContainer: '#9D174D', // pink-800
  onSecondaryContainer: '#FBCFE8', // pink-200
  background: '#111827', // gray-900
  surface: '#1F2937', // gray-800
  surfaceVariant: '#374151', // gray-700
  error: '#F87171', // red-400
  errorContainer: '#7F1D1D', // red-900
  onErrorContainer: '#FEE2E2', // red-100
  success: '#34D399', // emerald-400
  successContainer: '#064E3B', // emerald-900
  warning: '#FCD34D', // amber-300
  warningContainer: '#78350F', // amber-900
  onPrimary: '#1E1B4B', // indigo-950
  onSecondary: '#500724', // pink-950
  onBackground: '#F9FAFB', // gray-50
  onSurface: '#F3F4F6', // gray-100
  onSurfaceVariant: '#9CA3AF', // gray-400
  onError: '#690005', // dark red — legible on red-400
  outline: '#374151', // gray-700
  outlineVariant: '#4B5563', // gray-600
} as const

// ─── Light theme ──────────────────────────────────────────────────────────
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    onPrimary: palette.onPrimary,
    primaryContainer: palette.primaryContainer,
    onPrimaryContainer: palette.onPrimaryContainer,
    secondary: palette.secondary,
    onSecondary: palette.onSecondary,
    secondaryContainer: palette.secondaryContainer,
    onSecondaryContainer: palette.onSecondaryContainer,
    background: palette.background,
    onBackground: palette.onBackground,
    surface: palette.surface,
    onSurface: palette.onSurface,
    surfaceVariant: palette.surfaceVariant,
    onSurfaceVariant: palette.onSurfaceVariant,
    error: palette.error,
    onError: palette.onError,
    errorContainer: palette.errorContainer,
    onErrorContainer: palette.onErrorContainer,
    success: palette.success,
    successContainer: palette.successContainer,
    warning: palette.warning,
    warningContainer: palette.warningContainer,
    outline: palette.outline,
    outlineVariant: palette.outlineVariant,
  },
}

// ─── Dark theme ───────────────────────────────────────────────────────────
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkPalette.primary,
    onPrimary: darkPalette.onPrimary,
    primaryContainer: darkPalette.primaryContainer,
    onPrimaryContainer: darkPalette.onPrimaryContainer,
    secondary: darkPalette.secondary,
    onSecondary: darkPalette.onSecondary,
    secondaryContainer: darkPalette.secondaryContainer,
    onSecondaryContainer: darkPalette.onSecondaryContainer,
    background: darkPalette.background,
    onBackground: darkPalette.onBackground,
    surface: darkPalette.surface,
    onSurface: darkPalette.onSurface,
    surfaceVariant: darkPalette.surfaceVariant,
    onSurfaceVariant: darkPalette.onSurfaceVariant,
    error: darkPalette.error,
    onError: darkPalette.onError,
    errorContainer: darkPalette.errorContainer,
    onErrorContainer: darkPalette.onErrorContainer,
    success: darkPalette.success,
    successContainer: darkPalette.successContainer,
    warning: darkPalette.warning,
    warningContainer: darkPalette.warningContainer,
    outline: darkPalette.outline,
    outlineVariant: darkPalette.outlineVariant,
  },
}

export type AppTheme = typeof lightTheme

// ─── Theme config (edit this when consuming the template) ─────────────────
//
// userSwitchable: true  → user sees a theme toggle in Settings (template default)
// userSwitchable: false → theme is locked to `fixed`; toggle is hidden entirely
//
// When userSwitchable is false, set `fixed` to 'light' or 'dark'.
// 'system' is not a valid fixed value — it only makes sense when the user can override it.
export const THEME_CONFIG = {
  userSwitchable: true,
  fixed: 'light' as 'light' | 'dark',
} as const

// Typed wrapper so every component gets autocomplete on our custom color tokens
export const useAppTheme = () => useTheme<AppTheme>()
