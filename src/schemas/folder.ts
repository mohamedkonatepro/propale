import { z } from 'zod';

export const folderSchema = z.object({
  name: z.string().min(1, 'Nom est requis'),
  siret: z.string().min(14, 'SIRET doit contenir 14 caractères').max(14, 'SIRET doit contenir 14 caractères'),
  siren: z.string().optional(),
  ape_code: z.string().optional(),
  activity_sector: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  postalcode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  id: z.string().optional(),
});

export type FolderFormInputs = z.infer<typeof folderSchema>;
