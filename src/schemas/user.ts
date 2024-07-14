import { z } from 'zod';

export const userSchema = z.object({
  firstname: z.string().min(1, "Le prénom est requis"),
  lastname: z.string().min(1, "Le nom est requis"),
  role: z.string().min(1, "Le rôle est requis"),
  position: z.string().min(1, "La fonction est requise"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Le téléphone est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
