import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { Screen } from '@/components/layout'
import { Avatar, Button, Card, Divider } from '@/components/ui'
import { useAuthStore } from '@/store/auth'
import { useAppTheme } from '@/theme'
import { getInitials } from '@/lib/user'

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { colors } = useAppTheme()

  const initials = getInitials(user)

  return (
    <Screen>
      <Text variant="headlineSmall" style={[styles.heading, { color: colors.onBackground }]}>
        Profile
      </Text>

      <Card contentStyle={styles.profileContent}>
        <Avatar label={initials} size={72} />
        <Text variant="titleLarge" style={{ color: colors.onSurface }}>
          {user?.name ?? '—'}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {user?.email}
        </Text>
      </Card>

      <Divider spacing={4} />

      <Button mode="outlined" fullWidth icon="logout" onPress={logout}>
        Sign Out
      </Button>
    </Screen>
  )
}

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
  },
  profileContent: {
    alignItems: 'center',
    gap: 8,
  },
})
