import { useAppTheme } from '@/theme'
import { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export interface ScreenProps {
  children: ReactNode
  /** Allow the content to scroll vertically (default: true) */
  scrollable?: boolean
  /** Centre content vertically — useful for auth/empty-state screens (default: false) */
  centered?: boolean
  /** Override the outer SafeAreaView background */
  style?: StyleProp<ViewStyle>
  /** Applied to the ScrollView contentContainer or inner View */
  contentContainerStyle?: StyleProp<ViewStyle>
  /** Extra bottom padding added to contentContainer (e.g. for a sticky footer) */
  bottomSpacing?: number
}

export function Screen({
  children,
  scrollable = true,
  centered = false,
  style,
  contentContainerStyle,
  bottomSpacing = 0,
}: ScreenProps) {
  const { colors } = useAppTheme()

  const safeStyle = [{ backgroundColor: colors.background }, styles.safe, style]

  const inner = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        centered && styles.centered,
        bottomSpacing ? { paddingBottom: bottomSpacing } : null,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        centered && styles.centered,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  )

  return (
    <SafeAreaView style={safeStyle}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {inner}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
})
