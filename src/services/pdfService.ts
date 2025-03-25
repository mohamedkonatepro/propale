import { ExternalRepository } from '@/repositories/externalRepository';
import { ValidationError, logError, handleValidationError } from '@/utils/errors';
import { validateGeneratePdfData } from '@/validation/pdfValidation';

export const generatePdf = async (url: string, nameFile: string): Promise<void> => {
  try {
    // Validation des données d'entrée
    const validatedData = validateGeneratePdfData({ url, nameFile });

    const blob = await ExternalRepository.generatePdf({ url: validatedData.url });
    const filename = validatedData.nameFile.endsWith('.pdf') ? validatedData.nameFile : `${validatedData.nameFile}.pdf`;
    
    ExternalRepository.downloadBlob(blob, filename);
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      handleValidationError(error);
    }
    logError(error, 'PDFService/generatePdf');
    throw error;
  }
};
