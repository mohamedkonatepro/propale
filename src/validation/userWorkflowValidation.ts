import { z } from 'zod';
import { userSchema } from '../schemas/user';

// Schema for user creation workflow
export const createUserWorkflowSchema = z.object({
  formInputs: userSchema,
  companyId: z.string().uuid('Company ID must be a valid UUID').min(1, 'Company ID is required')
});

// Derived types
export type CreateUserWorkflowInput = z.infer<typeof createUserWorkflowSchema>;

// Validation function
export function validateCreateUserWorkflowData(data: unknown): CreateUserWorkflowInput {
  const result = createUserWorkflowSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`User workflow validation failed: ${errors}`);
  }
  
  return result.data;
}