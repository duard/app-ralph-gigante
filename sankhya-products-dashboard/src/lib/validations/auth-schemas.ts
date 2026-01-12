import { z } from 'zod';

/**
 * Login schema
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Usuário deve ter ao menos 3 caracteres')
    .max(50, 'Usuário deve ter no máximo 50 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter ao menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

/**
 * Registration schema
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Nome deve ter ao menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres'),
    username: z
      .string()
      .min(3, 'Usuário deve ter ao menos 3 caracteres')
      .max(50, 'Usuário deve ter no máximo 50 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Usuário só pode conter letras, números e _'),
    password: z
      .string()
      .min(8, 'Senha deve ter ao menos 8 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres'),
});

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z
      .string()
      .min(8, 'Senha deve ter ao menos 8 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Nova senha deve ter ao menos 8 caracteres')
      .max(100, 'Nova senha deve ter no máximo 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
