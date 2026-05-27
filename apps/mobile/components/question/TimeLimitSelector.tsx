import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Chip } from '@/components/ui/Chip'
import { useAppTheme } from '@/theme'
import { TIME_LIMIT_OPTIONS } from '@/validation/question'

interface TimeLimitSelectorProps {
  value: number
  onChange: (value: number) => void
}

export function TimeLimitSelector({ value, onChange }: TimeLimitSelectorProps) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={{ color: colors.onSurface }}>
        Time Limit
      </Text>
      <View style={styles.chips}>
        {TIME_LIMIT_OPTIONS.map((seconds) => {
          const isSelected = value === seconds
          return (
            <Chip
              key={seconds}
              label={`${seconds}s`}
              selected={isSelected}
              onPress={() => onChange(seconds)}
              style={isSelected ? { backgroundColor: colors.primaryContainer } : undefined}
              textStyle={isSelected ? { color: colors.primary } : undefined}
            />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
})
