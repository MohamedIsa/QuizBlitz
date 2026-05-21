import type { ReactNode } from 'react'
import { View, TouchableOpacity, Pressable, Keyboard, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { QBText } from '@/components/ui'
import { tokens } from '@/theme/tokens'

interface AuthShellProps {
  children: ReactNode
  footer?: ReactNode
  back?: boolean
  title?: string
  sub?: ReactNode
}

export function AuthShell({ children, footer, back = true, title, sub }: AuthShellProps) {
  const insets = useSafeAreaInsets()

  return (
    <Pressable style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]} onPress={Keyboard.dismiss}>
      {back ? (
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="chevron-left" size={22} color={tokens.color.ink.ink} />
          </TouchableOpacity>
        </View>
      ) : null}

      {title ? (
        <View style={styles.titleSection}>
          <QBText variant="displayMd">{title}</QBText>
          {sub ? (
            <QBText variant="body" color="muted" style={styles.sub}>{sub}</QBText>
          ) : null}
        </View>
      ) : null}

      <View style={styles.content}>
        {children}
      </View>

      {footer ? (
        <View style={styles.footer}>
          {footer}
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.ink.surface,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: tokens.color.ink.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  sub: {
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 16,
    gap: 12,
  },
})
