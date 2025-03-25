import { createCompany } from './companyService';
import { BusinessRulesService } from './businessRulesService';
import { logError } from '@/utils/errors';

export interface CreateCompanyWorkflowResult {
  success: boolean;
  companyId?: string;
  message: string;
}

export class CompanyWorkflowService {
  /**
   * Workflow complet de création d'entreprise avec toutes les validations métier
   */
  static async createCompanyWithWorkflow(data: any): Promise<CreateCompanyWorkflowResult> {
    try {
      // 1. Validation des règles métier (limites de dossiers)
      await BusinessRulesService.validateCompanyCreation(data.companyId);
      
      // 2. Création de l'entreprise
      const company = await createCompany(data);
      
      return {
        success: true,
        companyId: company?.id,
        message: `${data.name} a été ajouté avec succès à la liste.`
      };

    } catch (error) {
      logError(error, 'CompanyWorkflowService/createCompanyWithWorkflow');
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Une erreur est survenue lors de la création du dossier";
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Workflow complet de création de prospect
   */
  static async createProspectWithWorkflow(data: any): Promise<CreateCompanyWorkflowResult> {
    try {
      // Pour les prospects, on utilise directement le service existant
      const result = await createCompany(data);
      
      return {
        success: !!result,
        companyId: result?.id,
        message: result ? 'Le prospect a été créé avec succès.' : 'Erreur lors de la création du prospect.'
      };

    } catch (error) {
      logError(error, 'CompanyWorkflowService/createProspectWithWorkflow');
      
      return {
        success: false,
        message: 'Erreur lors de la création du prospect.'
      };
    }
  }
}