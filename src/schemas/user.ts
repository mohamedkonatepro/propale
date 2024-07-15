import { z } from 'zod';
import { ROLES } from '@/constants/roles';

export const userSchema = z.object({
  firstname: z.string().min(1, 'Prénom est requis'),
  lastname: z.string().min(1, 'Nom est requis'),
  role: z.enum([ROLES.ADMIN, ROLES.SALES]),
  position: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Mot de passe doit contenir au moins 8 caractères'),
});

export type UserFormInputs = z.infer<typeof userSchema>;
