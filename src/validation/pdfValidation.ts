import { z } from 'zod';

// Validation for PDF generation
export const generatePdfSchema = z.object({
  url: z.string().url('Invalid URL format').min(1, 'URL is required'),
  nameFile: z.string().min(1, 'Filename is required').max(100, 'Filename too long')
    .refine(name => !/[<>:"/\\|?*]/.test(name), 'Invalid characters in filename'),
});

// Derived types
export type GeneratePdfInput = z.infer<typeof generatePdfSchema>;

// Validation function
export function validateGeneratePdfData(data: unknown): GeneratePdfInput {
  const result = generatePdfSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`PDF validation failed: ${errors}`);
  }
  
  return result.data;
}