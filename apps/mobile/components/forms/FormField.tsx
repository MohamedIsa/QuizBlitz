import React from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form'
import { TextInput } from '@/components/ui/TextInput'
import type { TextInputProps } from '@/components/ui/TextInput'

export interface FormFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'errorText' | 'ref' | 'error'> {
  name: Path<T>
  control: Control<T>
  /** react-hook-form FieldError — message is extracted automatically */
  error?: FieldError
}

export function FormField<T extends FieldValues>({
  name,
  control,
  error,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          value={value as string | undefined}
          onChangeText={onChange}
          onBlur={onBlur}
          errorText={error?.message}
          {...inputProps}
        />
      )}
    />
  )
}
