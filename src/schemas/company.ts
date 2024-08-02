import { ROLES } from '@/constants/roles';
import { z } from 'zod';

export const companySchema = z.object({
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
});


export type CompanyFormInputs = z.infer<typeof companySchema>;