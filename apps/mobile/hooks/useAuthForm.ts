import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Control, DefaultValues, FieldErrors, FieldValues, Resolver } from 'react-hook-form'

// Accept whatever zodResolver accepts as its first argument so we stay
// compatible with both zod v3 and v4 without importing their internal types.
type AnyZodSchema = Parameters<typeof zodResolver>[0]

interface UseAuthFormOptions<T extends FieldValues> {
  schema: AnyZodSchema
  onSubmit: (data: T) => Promise<void>
  onError?: (err: unknown) => void
  defaultValues?: DefaultValues<T>
}

export function useAuthForm<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  defaultValues,
}: UseAuthFormOptions<T>) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = useForm<T>({
    // Cast to Resolver<T> so useForm<T> is fully typed; the resolver itself
    // still validates against the schema at runtime.
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues,
    mode: 'onTouched',
  })

  const handleSubmit = rhfHandleSubmit(async (data: T) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
    } catch (err) {
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  })

  return {
    // Cast strips the free TTransformedValues param that leaks when the
    // resolver type is erased above, keeping call-sites simply typed.
    control: control as unknown as Control<T>,
    errors: errors as FieldErrors<T>,
    reset,
    isLoading,
    handleSubmit,
  }
}
