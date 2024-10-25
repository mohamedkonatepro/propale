import { ROLES } from '@/constants/roles';
import { z } from 'zod';

export const companySchema = z.object({
  companyId: z.string().optional(),
  name: z.string().min(1, 'Raison sociale est requise'),
  siren: z.string().min(9, 'Numéro SIREN doit être de 9 chiffres').max(9, 'Numéro SIREN doit être de 9 chiffres'),
  ape_code: z.string().min(1, 'Code APE est requis'),
  activity_sector: z.string().min(1, 'Secteur d’activité est requis'),
  firstname: z.string().min(1, 'Prénom est requis'),
  lastname: z.string().min(1, 'Nom est requis'),
  position: z.string().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.SALES, ROLES.PROSPECT]).optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalcode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  heat_level: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  additionalContacts: z.array(
    z.object({
      firstname: z.string().min(1, "Prénom est requis"),
      lastname: z.string().min(1, "Nom est requis"),
      position: z.string().optional(),
      role: z.string().default(ROLES.PROSPECT),
      email: z.string().email("Email invalide").min(1, "Email est requis"),
      phone: z.string().optional(),
    })
  ).optional().default([]),
});


export const companyDetailsSchema = z.object({
  companyId: z.string().optional(),
  name: z.string().min(1, 'Raison sociale est requise'),
  siren: z.string().min(9, 'Numéro SIREN doit être de 9 chiffres').max(9, 'Numéro SIREN doit être de 9 chiffres'),
  ape_code: z.string().min(1, 'Code APE est requis'),
  activity_sector: z.string().min(1, 'Secteur d’activité est requis'),
  firstname: z.string().min(1, 'Prénom est requis'),
  lastname: z.string().min(1, 'Nom est requis'),
  position: z.string().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.SALES, ROLES.PROSPECT]).optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  password: z.string().min(6, "Mot de passe doit comporter au moins 6 caractères").optional(),
  confirmPassword: z.string().min(6, "Confirmation du mot de passe est requise").optional(),
  address: z.string().optional(),
  postalcode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  heat_level: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type companyDetailsInputs = z.infer<typeof companyDetailsSchema>;
export type CompanyFormInputs = z.infer<typeof companySchema>;