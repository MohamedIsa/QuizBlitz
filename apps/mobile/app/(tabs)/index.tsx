import { Screen } from '@/components/layout'
import { Avatar, Card } from '@/components/ui'
import { useAuthStore } from '@/store/auth'
import { useAppTheme } from '@/theme'
import { getInitials } from '@/lib/user'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user)
  const { colors } = useAppTheme()

  const initials = getInitials(user)

  return (
    <Screen>
      <Text variant="headlineSmall" style={[styles.heading, { color: colors.onBackground }]}>
        Home
      </Text>

      <Card>
        <Avatar label={initials} size={56} />
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>
          {user?.name ?? 'Welcome'}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
  },
})
