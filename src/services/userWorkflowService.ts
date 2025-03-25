import { createUser, sendPasswordResetEmail } from './userService';
import { createProfile } from './profileService';
import { associateProfileWithCompany } from './companyProfileService';
import { BusinessRulesService } from './businessRulesService';
import { UserFormInputs } from '@/schemas/user';
import { validateCreateUserWorkflowData } from '@/validation/userWorkflowValidation';
import { logError } from '@/utils/errors';

export interface CreateUserWorkflowResult {
  success: boolean;
  userId?: string;
  profileId?: string;
  message: string;
}

export class UserWorkflowService {
  /**
   * Complete user creation workflow with all business validations
   */
  static async createUserWithWorkflow(
    formInputs: UserFormInputs, 
    companyId: string
  ): Promise<CreateUserWorkflowResult> {
    try {
      // 1. Validate input data
      const validatedData = validateCreateUserWorkflowData({ formInputs, companyId });
      
      // 2. Validate business rules (limits, etc.)
      await BusinessRulesService.validateUserCreation(companyId);
      
      // 3. Create user in Auth system
      const user = await createUser(validatedData.formInputs.email, validatedData.formInputs.password);
      if (!user) {
        throw new Error('Failed to create user in authentication system');
      }

      // 4. Create profile
      const profileData = {
        ...validatedData.formInputs,
        userId: user.id,
      };
      await createProfile(profileData);

      // 5. Associate with company
      await associateProfileWithCompany(user.id, companyId);

      // 6. Send confirmation email
      await sendPasswordResetEmail(validatedData.formInputs.email);

      return {
        success: true,
        userId: user.id,
        profileId: user.id, // En supposant que profile.id === user.id
        message: `${profileData.firstname} ${profileData.lastname} a été ajouté·e avec succès. Un email de confirmation a été envoyé.`
      };

    } catch (error) {
      logError(error, 'UserWorkflowService/createUserWithWorkflow');
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Une erreur est survenue lors de la création de l'utilisateur";
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}