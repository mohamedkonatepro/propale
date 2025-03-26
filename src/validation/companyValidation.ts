import { z } from 'zod';

// Validation for company creation
export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255, 'Company name too long'),
  siren: z.string().length(9, 'SIREN must be exactly 9 digits').regex(/^\d+$/, 'SIREN must contain only digits'),
  siret: z.string().length(14, 'SIRET must be exactly 14 digits').regex(/^\d+$/, 'SIRET must contain only digits').optional().or(z.literal('')),
  ape_code: z.string().max(10, 'APE code too long').optional(),
  activity_sector: z.string().max(255, 'Activity sector too long').optional(),
  address: z.string().max(255, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  postalcode: z.string().max(10, 'Postal code too long').optional(),
  country: z.string().max(100, 'Country name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  heat_level: z.enum(['hot', 'warm', 'cold']).optional(),
  status: z.enum(['new', 'audit', 'proposal', 'concluded', 'lost']).optional(),
  type: z.enum(['company', 'prospect']).optional(),
  company_id: z.string().uuid().optional().or(z.literal('')),
});

// Validation for company update
export const updateCompanySchema = createCompanySchema.partial().extend({
  id: z.string().uuid('Invalid company ID'),
});

// Validation for prospect creation with contacts
export const createProspectSchema = createCompanySchema.extend({
  // Primary contact information
  firstname: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastname: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  position: z.string().max(100, 'Position too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  role: z.string().max(50, 'Role too long').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  
  // Additional contacts
  additionalContacts: z.array(z.object({
    firstname: z.string().min(1, 'First name is required').max(100, 'First name too long'),
    lastname: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
    email: z.string().email('Invalid email format').max(255, 'Email too long'),
    position: z.string().max(100, 'Position too long').optional(),
    phone: z.string().max(20, 'Phone number too long').optional(),
    role: z.string().max(50, 'Role too long').optional(),
  })).optional().default([]),
});

// Types derived from Zod schemas
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateProspectInput = z.infer<typeof createProspectSchema>;

// Helper function to validate and sanitize data
export function validateCompanyData(data: unknown): CreateCompanyInput {
  const result = createCompanySchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  
  return result.data;
}

export function validateUpdateCompanyData(data: unknown): UpdateCompanyInput {
  const result = updateCompanySchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  
  return result.data;
}

export function validateProspectData(data: unknown): CreateProspectInput {
  const result = createProspectSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  
  return result.data;
}