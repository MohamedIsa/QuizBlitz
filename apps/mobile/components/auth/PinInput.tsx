import { useRef } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { QBText } from '@/components/ui'
import { tokens } from '@/theme/tokens'

interface PinInputProps {
  value: string
  onChange: (val: string) => void
  error?: boolean
}

export function PinInput({ value, onChange, error }: PinInputProps) {
  const inputRef = useRef<TextInput>(null)
  const cells = Array.from({ length: 6 }, (_, i) => value[i] ?? '')

  const handleChange = (text: string) => {
    onChange(text.replace(/\D/g, '').slice(0, 6))
  }

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      {/* Single hidden input that captures all keystrokes */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        style={styles.hiddenInput}
        caretHidden
      />

      {/* Visual cells */}
      <View style={styles.row}>
        {cells.map((char, i) => (
          <View
            key={i}
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
          >
            <QBText style={styles.cellText}>{char}</QBText>
          </View>
        ))}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 22,
    fontFamily: tokens.font.uiBold,
  },
})
