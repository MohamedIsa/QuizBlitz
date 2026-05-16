import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
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
  const {
    control,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues,
    mode: 'onTouched',
  })

  const mutation = useMutation({
    mutationFn: onSubmit,
    onError: (err) => onError?.(err),
  })

  const handleSubmit = rhfHandleSubmit((data: T) => mutation.mutate(data))

  return {
    control: control as unknown as Control<T>,
    errors: errors as FieldErrors<T>,
    reset,
    isLoading: mutation.isPending,
    handleSubmit,
  }
}
