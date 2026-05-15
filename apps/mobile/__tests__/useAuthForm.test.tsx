import { act, renderHook } from '@testing-library/react-native'
import { z } from 'zod'
import { useAuthForm } from '@/hooks/useAuthForm'

// Simple schema — validates an object with a single required field
const testSchema = z.object({
  email: z.string().email(),
})

// Schema with a Zod transform — proves data parsing flows through to onSubmit
const transformSchema = z.object({
  email: z
    .string()
    .email()
    .transform((v) => v.toLowerCase().trim()),
})

type TestInput = z.infer<typeof testSchema>
type TransformInput = z.infer<typeof transformSchema>

const VALID_DEFAULTS: TestInput = { email: 'test@example.com' }

describe('useAuthForm', () => {
  it('calls onSubmit and resets isLoading on success', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAuthForm<TestInput>({
        schema: testSchema,
        onSubmit,
        defaultValues: VALID_DEFAULTS,
      }),
    )

    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(VALID_DEFAULTS)
    expect(result.current.isLoading).toBe(false)
  })

  it('calls onError and resets isLoading when onSubmit throws', async () => {
    const error = new Error('Network error')
    const onSubmit = jest.fn().mockRejectedValue(error)
    const onError = jest.fn()

    const { result } = renderHook(() =>
      useAuthForm<TestInput>({
        schema: testSchema,
        onSubmit,
        onError,
        defaultValues: VALID_DEFAULTS,
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(error)
    expect(result.current.isLoading).toBe(false)
  })

  it('does not throw when onError is omitted and onSubmit rejects', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() =>
      useAuthForm<TestInput>({
        schema: testSchema,
        onSubmit,
        defaultValues: VALID_DEFAULTS,
      }),
    )

    await expect(
      act(async () => {
        await result.current.handleSubmit()
      }),
    ).resolves.not.toThrow()

    expect(result.current.isLoading).toBe(false)
  })

  it('flips isLoading true while submit is in flight', async () => {
    let release!: () => void
    const inflight = new Promise<void>((r) => {
      release = r
    })
    const onSubmit = jest.fn(() => inflight)

    const { result } = renderHook(() =>
      useAuthForm<TestInput>({
        schema: testSchema,
        onSubmit,
        defaultValues: VALID_DEFAULTS,
      }),
    )

    let submitDone!: Promise<void>
    await act(async () => {
      submitDone = result.current.handleSubmit() as unknown as Promise<void>
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      release()
      await submitDone
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('passes Zod-transformed data to onSubmit (email lowercased)', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useAuthForm<TransformInput>({
        schema: transformSchema,
        onSubmit,
        defaultValues: { email: 'ALICE@EXAMPLE.COM' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(onSubmit).toHaveBeenCalledWith({ email: 'alice@example.com' })
  })

  it('surfaces Zod validation errors via errors.<field>', async () => {
    const onSubmit = jest.fn()

    const { result } = renderHook(() =>
      useAuthForm<TestInput>({
        schema: testSchema,
        onSubmit,
        defaultValues: { email: 'not-an-email' },
      }),
    )

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors.email).toBeDefined()
    expect(result.current.errors.email?.message).toBeTruthy()
  })
})
