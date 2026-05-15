import React, { useState } from 'react'
import { View } from 'react-native'
import { TextInput as PaperTextInput, HelperText } from 'react-native-paper'
import type { TextInputProps as PaperTextInputProps } from 'react-native-paper'
import type { StyleProp, ViewStyle } from 'react-native'

export interface TextInputProps extends Omit<PaperTextInputProps, 'theme'> {
  /** Shown in red below the field and sets the error state */
  errorText?: string
  /** Shown in muted grey below the field when there is no error */
  helperText?: string
  /** Style for the outer View that wraps the input + helper text */
  containerStyle?: StyleProp<ViewStyle>
}

// Note: ref forwarding is intentionally omitted — Paper's TextInput uses an
// internal TextInputHandles type that is incompatible with RNTextInput's ref shape.
// Paper handles focus programmatically via its own imperative handle when needed.
export function TextInput({
  errorText,
  helperText,
  containerStyle,
  secureTextEntry,
  mode = 'outlined',
  ...props
}: TextInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false)
  const hasError = Boolean(errorText)

  return (
    <View style={containerStyle}>
      <PaperTextInput
        mode={mode}
        error={hasError}
        secureTextEntry={hidden}
        right={
          secureTextEntry ? (
            <PaperTextInput.Icon
              icon={hidden ? 'eye' : 'eye-off'}
              onPress={() => setHidden((h) => !h)}
            />
          ) : undefined
        }
        {...props}
      />

      {hasError ? (
        <HelperText type="error" visible padding="none">
          {errorText}
        </HelperText>
      ) : helperText ? (
        <HelperText type="info" visible padding="none">
          {helperText}
        </HelperText>
      ) : null}
    </View>
  )
}
