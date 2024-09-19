import { z } from 'zod';
import { ROLES } from '@/constants/roles';

// Schema for dropdown values
const dropdownValueSchema = z.object({
  question_id: z.string().uuid(),
  value: z.string().min(1, "La valeur de la liste déroulante ne peut pas être vide"),
});

// Schema for questions
const questionSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1, "Le texte de la question est requis"),
  type: z.enum(['YesNo', 'Dropdown', 'DateRange', 'FreeText']),
  mapping: z.record(z.string().uuid()),
  dropdownValues: z.array(dropdownValueSchema).optional(),
});

// Schema for products
const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Le nom du produit est requis"),
  price: z.number().min(0, "Le prix ne peut pas être négatif"),
  quantity: z.number().int().min(0, "La quantité ne peut pas être négative"),
});

// Schema for workflow
export const workflowSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Le nom du workflow est requis"),
  products: z.array(productSchema).min(1, "Au moins un produit est requis"),
  questions: z.array(questionSchema).min(1, "Au moins une question est requise"),
});

// Schema for company settings
export const companySettingsSchema = z.object({
  company_id: z.string().uuid(),
  workflows_allowed: z.number().int().min(0),
  users_allowed: z.number().int().min(0),
  contacts_per_prospect: z.number().int().min(0),
  folders_allowed: z.number().int().min(0),
  vision_canevas: z.boolean(),
  vision_audit: z.boolean(),
  composition_workflow: z.boolean(),
  license_type: z.enum(['individual', 'enterprise']),
  is_account_disabled: z.boolean(),
  workflow: workflowSchema,
});

// Inferred types
export type Workflow = z.infer<typeof workflowSchema>;
export type CompanySettings = z.infer<typeof companySettingsSchema>;
