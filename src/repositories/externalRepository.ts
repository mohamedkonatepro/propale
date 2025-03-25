import { ExternalServiceError, logError } from '@/utils/errors';

export interface EmailRecipient {
  email: string;
}

export interface EmailRequest {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  subject: string;
  html: string;
}

export interface PdfGenerationRequest {
  url: string;
}

export class ExternalRepository {
  
  // Service d'envoi d'email
  static async sendEmail(emailData: EmailRequest): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new ExternalServiceError('Email Service', errorData.error || `HTTP ${response.status}`);
      }

      // Pas de données à retourner pour l'envoi d'email
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }
      
      logError(error, 'EmailService');
      throw new ExternalServiceError('Email Service', 'Failed to send email');
    }
  }

  // Service de génération PDF
  static async generatePdf(pdfData: PdfGenerationRequest): Promise<Blob> {
    try {
      const response = await fetch('/api/generatePdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        throw new ExternalServiceError('PDF Service', `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      // Vérifier que c'est bien un PDF
      if (!blob.type.includes('application/pdf')) {
        throw new ExternalServiceError('PDF Service', 'Invalid PDF response');
      }

      return blob;
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }
      
      logError(error, 'PDFService');
      throw new ExternalServiceError('PDF Service', 'Failed to generate PDF');
    }
  }

  // Fonction helper pour download
  static downloadBlob(blob: Blob, filename: string): void {
    try {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Nettoyer l'URL object
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      logError(error, 'FileDownload');
      throw new ExternalServiceError('File Download', 'Failed to download file');
    }
  }
}