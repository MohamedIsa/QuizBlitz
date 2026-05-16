import { useRef } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { tokens } from '@/theme/tokens'

interface PinInputProps {
  value: string
  onChange: (val: string) => void
  error?: boolean
}

export function PinInput({ value, onChange, error }: PinInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([])
  const cells = Array.from({ length: 6 }, (_, i) => value[i] ?? '')

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, 6)
      onChange(digits)
      inputRefs.current[Math.min(digits.length, 5)]?.focus()
      return
    }
    const next = cells.slice()
    next[index] = text.replace(/\D/g, '')
    onChange(next.join(''))
    if (text && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !cells[index] && index > 0) {
      const next = cells.slice()
      next[index - 1] = ''
      onChange(next.join(''))
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <View style={styles.row}>
      {cells.map((char, i) => (
        <TextInput
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          style={[
            styles.cell,
            {
              borderColor: error
                ? tokens.color.semantic.wrong
                : char
                  ? tokens.color.brand.violet
                  : tokens.color.ink.border,
              backgroundColor: char ? tokens.color.ink.surface : tokens.color.ink.surface3,
              borderRadius: tokens.radius.sm,
            },
          ]}
          value={char}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          textContentType="oneTimeCode"
          autoComplete={i === 0 ? 'sms-otp' : 'off'}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  cell: { width: 48, height: 56, fontSize: 22, fontWeight: '700', borderWidth: 1.5 },
})
