import { z } from 'zod';

// Validation for email sending
export const sendEmailSchema = z.object({
  contactsEmail: z.array(z.string().email('Invalid email format')).min(1, 'At least one email required'),
  content: z.string().min(1, 'Email content is required'),
  subject: z.string().min(1, 'Email subject is required').max(200, 'Subject too long'),
  space: z.boolean().optional().default(true),
});

export const sendEmailByContactsSchema = z.object({
  contacts: z.array(z.object({
    email: z.string().email('Invalid email format'),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
  })).min(1, 'At least one contact required'),
  content: z.string().min(1, 'Email content is required'),
  subject: z.string().min(1, 'Email subject is required').max(200, 'Subject too long'),
  space: z.boolean().optional().default(true),
  user: z.object({
    email: z.string().email('Invalid user email format'),
  }).optional(),
});

// Derived types
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendEmailByContactsInput = z.infer<typeof sendEmailByContactsSchema>;

// Validation functions
export function validateSendEmailData(data: unknown): SendEmailInput {
  const result = sendEmailSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Email validation failed: ${errors}`);
  }
  
  return result.data;
}

export function validateSendEmailByContactsData(data: unknown): SendEmailByContactsInput {
  const result = sendEmailByContactsSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Email validation failed: ${errors}`);
  }
  
  return result.data;
}