import type { ReactNode } from 'react'
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { QBText } from '@/components/ui'
import { tokens } from '@/theme/tokens'

interface AuthShellProps {
  children: ReactNode
  back?: boolean
  title?: string
  sub?: ReactNode
}

export function AuthShell({ children, back = true, title, sub }: AuthShellProps) {
  const insets = useSafeAreaInsets()

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <View style={[styles.root, { paddingTop: insets.top }]}>
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
  },
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 28,
    flexGrow: 1,
  },
})
