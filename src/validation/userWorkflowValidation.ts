import { z } from 'zod';
import { userSchema } from '../schemas/user';

// Schéma pour le workflow de création d'utilisateur
export const createUserWorkflowSchema = z.object({
  formInputs: userSchema,
  companyId: z.string().uuid('Company ID must be a valid UUID').min(1, 'Company ID is required')
});

// Types dérivés
export type CreateUserWorkflowInput = z.infer<typeof createUserWorkflowSchema>;

// Fonction de validation
export function validateCreateUserWorkflowData(data: unknown): CreateUserWorkflowInput {
  const result = createUserWorkflowSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`User workflow validation failed: ${errors}`);
  }
  
  return result.data;
}