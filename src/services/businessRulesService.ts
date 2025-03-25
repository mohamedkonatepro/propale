import { countProfilesByCompanyId } from './profileService';
import { countCompaniesByParentId } from './companyService';
import { fetchCompanySettings } from './companySettingsService';
import { ValidationError } from '@/utils/errors';

export class BusinessRulesService {
  /**
   * Validates if a new company can be created according to configured limits
   */
  static async validateCompanyCreation(parentCompanyId: string): Promise<void> {
    const [currentFolderCount, settings] = await Promise.all([
      countCompaniesByParentId(parentCompanyId),
      fetchCompanySettings(parentCompanyId)
    ]);

    if (!settings) {
      throw new ValidationError(
        "Impossible de récupérer les paramètres de l'entreprise parente"
      );
    }

    if (currentFolderCount >= settings.folders_allowed) {
      throw new ValidationError(
        "Le nombre maximum de dossiers autorisés a été atteint"
      );
    }
  }

  /**
   * Validates if a new user can be created according to configured limits
   */
  static async validateUserCreation(companyId: string): Promise<void> {
    const [currentUserCount, settings] = await Promise.all([
      countProfilesByCompanyId(companyId),
      fetchCompanySettings(companyId)
    ]);

    if (!settings) {
      throw new ValidationError(
        "Impossible de récupérer les paramètres de l'entreprise"
      );
    }

    if (currentUserCount >= settings.users_allowed) {
      throw new ValidationError(
        "Le nombre maximum d'utilisateurs autorisés a été atteint"
      );
    }
  }

  /**
   * Validates general business rules before entity creation
   */
  static async validateEntityCreation(type: 'user' | 'company', companyId: string): Promise<void> {
    switch (type) {
      case 'user':
        await this.validateUserCreation(companyId);
        break;
      case 'company':
        await this.validateCompanyCreation(companyId);
        break;
      default:
        throw new ValidationError('Type d\'entité non supporté');
    }
  }
}