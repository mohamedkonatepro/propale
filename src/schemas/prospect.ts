import { z } from 'zod';

export const prospectSchema = z.object({
  name: z.string().min(1, 'Raison sociale est requise'),
  siren: z.string().min(9, 'Numéro SIREN doit être de 9 chiffres').max(9, 'Numéro SIREN doit être de 9 chiffres'),
  ape_code: z.string().min(1, 'Code APE est requis'),
  activity_sector: z.string().min(1, 'Secteur d’activité est requis'),
  address: z.string().optional(),
  postalcode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type ProspectFormInputs = z.infer<typeof prospectSchema>;