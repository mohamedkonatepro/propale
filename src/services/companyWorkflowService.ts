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
   * Complete company creation workflow with all business validations
   */
  static async createCompanyWithWorkflow(data: any): Promise<CreateCompanyWorkflowResult> {
    try {
      // 1. Business rules validation (folder limits)
      await BusinessRulesService.validateCompanyCreation(data.companyId);
      
      // 2. Company creation
      const company = await createCompany(data);
      
      return {
        success: true,
        companyId: company?.id,
        message: `${data.name} has been successfully added to the list.`
      };

    } catch (error) {
      logError(error, 'CompanyWorkflowService/createCompanyWithWorkflow');
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred during folder creation";
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Complete prospect creation workflow
   */
  static async createProspectWithWorkflow(data: any): Promise<CreateCompanyWorkflowResult> {
    try {
      // For prospects, we use the existing service directly
      const result = await createCompany(data);
      
      return {
        success: !!result,
        companyId: result?.id,
        message: result ? 'The prospect has been created successfully.' : 'Error during prospect creation.'
      };

    } catch (error) {
      logError(error, 'CompanyWorkflowService/createProspectWithWorkflow');
      
      return {
        success: false,
        message: 'Error during prospect creation.'
      };
    }
  }
}