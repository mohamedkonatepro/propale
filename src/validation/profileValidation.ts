import { z } from 'zod';

// Validation for profile creation
export const createProfileSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  firstname: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastname: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  position: z.string().max(100, 'Position too long').optional().default(''),
  phone: z.string().max(20, 'Phone number too long').optional().default(''),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  role: z.string().max(50, 'Role too long').default('user'),
  is_primary_contact: z.boolean().default(false),
});

// Validation for profile update
export const updateProfileSchema = z.object({
  id: z.string().uuid('Invalid profile ID'),
  firstname: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastname: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  position: z.string().max(100, 'Position too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  role: z.string().max(50, 'Role too long').optional(),
  blocked: z.boolean().optional(),
  is_primary_contact: z.boolean().optional(),
});

// Types derived from Zod schemas
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Helper functions to validate and sanitize data
export function validateCreateProfileData(data: unknown): CreateProfileInput {
  const result = createProfileSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Profile validation failed: ${errors}`);
  }
  
  return result.data;
}

export function validateUpdateProfileData(data: unknown): UpdateProfileInput {
  const result = updateProfileSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Profile validation failed: ${errors}`);
  }
  
  return result.data;
}