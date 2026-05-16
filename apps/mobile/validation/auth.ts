import { z } from 'zod'

// ─── Reusable field schemas ────────────────────────────────────────────────

const emailField = z
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .transform((v) => v.toLowerCase().trim())

const strongPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// ─── Schemas ───────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  // Login accepts any non-empty password — server validates correctness
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be fewer than 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
      .transform((v) => v.trim()),
    email: emailField,
    password: strongPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailField,
})

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
})

export const resetPasswordSchema = z
  .object({
    password: strongPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ─── Inferred types ────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type OtpInput = z.infer<typeof otpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
