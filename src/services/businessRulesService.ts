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
        "Unable to retrieve parent company settings"
      );
    }

    if (currentFolderCount >= settings.folders_allowed) {
      throw new ValidationError(
        "The maximum number of allowed folders has been reached"
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
        "Unable to retrieve company settings"
      );
    }

    if (currentUserCount >= settings.users_allowed) {
      throw new ValidationError(
        "The maximum number of allowed users has been reached"
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
        throw new ValidationError('Unsupported entity type');
    }
  }
}