import React, { createContext, useCallback, useContext, useState } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'
import { Snackbar as PaperSnackbar } from 'react-native-paper'
import { palette } from '@/theme'

// ─── Types ─────────────────────────────────────────────────────────────────
type SnackbarType = 'success' | 'error' | 'info' | 'warning'

export interface SnackbarOptions {
  type?: SnackbarType
  /** Duration in ms (default: 3000) */
  duration?: number
  action?: { label: string; onPress: () => void }
}

interface SnackbarState {
  visible: boolean
  message: string
  options: SnackbarOptions
}

interface SnackbarContextValue {
  show: (message: string, options?: SnackbarOptions) => void
  hide: () => void
}

// ─── Context ───────────────────────────────────────────────────────────────
const SnackbarContext = createContext<SnackbarContextValue | null>(null)

// ─── Background colours per type ──────────────────────────────────────────
const TYPE_COLORS: Record<SnackbarType, string> = {
  success: palette.success,
  error: palette.error,
  warning: palette.warning,
  info: palette.primary,
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    visible: false,
    message: '',
    options: {},
  })

  const show = useCallback((message: string, options: SnackbarOptions = {}) => {
    setState({ visible: true, message, options })
    // Android uses accessibilityLiveRegion below; iOS needs an explicit announce
    // because PaperSnackbar's role doesn't auto-trigger VoiceOver.
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message)
    }
  }, [])

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }))
  }, [])

  const bgColor = state.options.type ? TYPE_COLORS[state.options.type] : undefined

  return (
    <SnackbarContext.Provider value={{ show, hide }}>
      {children}
      <PaperSnackbar
        visible={state.visible}
        onDismiss={hide}
        duration={state.options.duration ?? 3000}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        action={
          state.options.action
            ? { label: state.options.action.label, onPress: state.options.action.onPress }
            : undefined
        }
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        {state.message}
      </PaperSnackbar>
    </SnackbarContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error('useSnackbar must be called inside <SnackbarProvider>')
  return ctx
}
