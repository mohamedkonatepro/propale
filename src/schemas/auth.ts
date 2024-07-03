import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit être au moins de 6 caractères' }),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Mot de passe doit être d'au moins 8 caractères" }).regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' }).regex(/[0-9]/, { message: 'Password must contain at least one number' }).regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  confirmPassword: z.string().min(8, { message: 'Confirmer Le mot de passe doit contenir au moins 8 caractères' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ['confirmPassword'],
});