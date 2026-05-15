import { StyleSheet, View } from 'react-native'
import { List, RadioButton, Switch, Text } from 'react-native-paper'
import { Screen } from '@/components/layout'
import { Card, Divider } from '@/components/ui'
import { useAppStore, type ThemeMode } from '@/store/app'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { useAppTheme, THEME_CONFIG } from '@/theme'

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'System default', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

export default function SettingsScreen() {
  const { colors } = useAppTheme()
  const { themeMode, setThemeMode } = useAppStore()
  const { isEnabled, canUseBiometrics, biometricType, toggle } = useBiometricAuth()

  const biometricLabel =
    biometricType === 'facial'
      ? 'Face ID'
      : biometricType === 'fingerprint'
        ? 'Touch ID / Fingerprint'
        : 'Biometric login'

  return (
    <Screen>
      <Text variant="headlineSmall" style={[styles.heading, { color: colors.onBackground }]}>
        Settings
      </Text>

      {THEME_CONFIG.userSwitchable && (
        <>
          <Card>
            <Text
              variant="titleSmall"
              style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
            >
              Appearance
            </Text>
            <RadioButton.Group
              onValueChange={(v) => setThemeMode(v as ThemeMode)}
              value={themeMode}
            >
              {THEME_OPTIONS.map((opt) => (
                <View key={opt.value} style={styles.radioRow}>
                  <RadioButton.Android value={opt.value} color={colors.primary} />
                  <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                    {opt.label}
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </Card>

          <Divider spacing={4} />
        </>
      )}

      <Card>
        <Text
          variant="titleSmall"
          style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
        >
          Security
        </Text>
        <List.Item
          title={biometricLabel}
          description={
            canUseBiometrics
              ? 'Skip the password on next sign-in'
              : 'Not currently available on this device'
          }
          titleStyle={{ color: colors.onSurface }}
          descriptionStyle={{ color: colors.onSurfaceVariant }}
          right={() => (
            <Switch
              value={isEnabled}
              onValueChange={toggle}
              disabled={!canUseBiometrics}
              color={colors.primary}
            />
          )}
        />
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
  },
  sectionLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
})
