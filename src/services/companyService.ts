import { Company, Profile } from '@/types/models';
import { fetchProfilesWithUserDetails } from './profileService';
import { companyDetailsInputs, CompanyFormInputs } from '@/schemas/company';
import { CompanyRepository } from '@/repositories/companyRepository';
import { ProfileRepository } from '@/repositories/profileRepository';
import { createUser, sendPasswordResetEmail } from './userService';
import { 
  validateCompanyData, 
  validateUpdateCompanyData, 
  validateProspectData,
  CreateCompanyInput,
  UpdateCompanyInput,
  CreateProspectInput
} from '@/validation/companyValidation';
import { handleValidationError, logError, ValidationError } from '@/utils/errors';

export const fetchCompanyById = async (companyId: string): Promise<Company | null> => {
  return await CompanyRepository.findById(companyId);
};

export const fetchTopMostParentCompanyCompanyById = async (companyId: string): Promise<Company | null> => {
  const company = await fetchCompanyById(companyId);
  if (company) {
    const topMostParentCompany = await findTopMostParentCompany(company);
    return topMostParentCompany;
  }
  return company;
};

// Recursively find the top-most parent company without a company_id
export const findTopMostParentCompany = async (company: Company): Promise<Company> => {
  if (!company.company_id) {
    return company;
  }

  const parentCompany = await fetchCompanyById(company.company_id);
  if (!parentCompany) {
    return company;
  }

  return findTopMostParentCompany(parentCompany);
};

export const fetchCompanyWithoutParentByProfileId = async (profileId: string): Promise<Company | null> => {
  return await CompanyRepository.findWithoutParentByProfileId(profileId);
};

export const fetchCompaniesWithParentByProfileId = async (profileId: string, search?: string): Promise<Company[]> => {
  return await CompanyRepository.findWithParentByProfileId(profileId, search);
};

export const fetchCompaniesByCompanyId = async (companyId: string, search?: string): Promise<Company[]> => {
  return await CompanyRepository.findByParentId(companyId, search);
};

export const fetchAllCompaniesWithoutParent = async (search?: string): Promise<Company[]> => {
  return await CompanyRepository.findAllWithoutParent(search);
};

// Create a new company - utilise createCompanyRecord
export const createCompany = async (dataModal: CompanyFormInputs | companyDetailsInputs): Promise<Company> => {
  return await createCompanyRecord(dataModal);
};

export const updateCompany = async (data: Company): Promise<boolean> => {
  await updateCompanyRecord(data.id, data);
  return true;
};

export const deleteCompany = async (companyId: string): Promise<boolean> => {
  await CompanyRepository.delete(companyId);
  return true;
};

export const createProspect = async (dataModal: CompanyFormInputs | companyDetailsInputs): Promise<Company> => {
  return await createProspectWithContacts(dataModal);
};

export const fetchProspects = async (
  companyId: string,
  search: string = "",
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Company[]; count: number }> => {
  return await CompanyRepository.findProspects(companyId, search, page, pageSize);
};


export const deleteProspect = async (companyId: string): Promise<boolean> => {
  await CompanyRepository.delete(companyId);
  return true;
};

export const fetchAndCategorizeProfiles = async (
  childCompanyId: string
): Promise<{ attachedProfiles: Profile[]; unattachedProfiles: Profile[] }> => {
  try {
    // Fetch the company and its top-most parent company
    const company = await fetchCompanyById(childCompanyId);
    if (!company) {
      throw new Error(`Company with ID ${childCompanyId} not found.`);
    }

    let parentCompany;

    if (company.company_id) {
      parentCompany = await fetchCompanyById(company.company_id);
    }
    if (!parentCompany) {
      throw new Error(`Parent company for company ID ${childCompanyId} not found.`);
    }

    // Fetch profiles for both parent and child companies
    const [parentCompanyProfiles, childCompanyProfiles] = await Promise.all([
      fetchProfilesWithUserDetails(parentCompany.id),
      fetchProfilesWithUserDetails(childCompanyId)
    ]);

    // Create a set of profile IDs associated with the child company for fast look-up
    const childCompanyProfileIds = new Set(childCompanyProfiles.map(profile => profile.id));

    // Categorize profiles into attached and unattached
    const attachedProfiles: Profile[] = [];
    const unattachedProfiles: Profile[] = [];

    parentCompanyProfiles.forEach(profile => {
      if (childCompanyProfileIds.has(profile.id)) {
        attachedProfiles.push(profile);
      } else {
        unattachedProfiles.push(profile);
      }
    });

    return { attachedProfiles, unattachedProfiles };
  } catch (error) {
    console.error('Error in fetchAndCategorizeProfiles:', error);
    throw error;
  }
};

export const checkSiretAndCompanyId = async (companyId: string, siret: string): Promise<boolean> => {
  return await CompanyRepository.checkSiretUnique(siret, companyId);
};


export const checkSirenAndCompanyId = async (companyId: string, siren: string): Promise<boolean> => {
  return await CompanyRepository.checkSirenUnique(siren, companyId);
};

export const countCompaniesByParentId = async (parentId: string): Promise<number> => {
  return await CompanyRepository.countByParentId(parentId);
};

export const countAllProspectsByCompanyId = async (companyId: string): Promise<number> => {
  return await CompanyRepository.countAllProspectsRecursively(companyId);
};

export const fetchProspectByUserId = async (userId: string): Promise<Company | null> => {
  return await CompanyRepository.findByUserId(userId);
};

export const updateProspectStatus = async (prospectId: string, status: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await CompanyRepository.updateStatus(prospectId, status);
    return { success: true, message: 'Status updated successfully' };
  } catch (error: any) {
    console.error('Error updating prospect status:', error.message);
    return { success: false, message: error.message };
  }
};

// Business logic methods for direct database operations

export const createCompanyRecord = async (dataModal: unknown): Promise<Company> => {
  try {
    // Validation des données d'entrée
    const validatedData = validateCompanyData(dataModal);
    
    return await CompanyRepository.create({
      company_id: validatedData.company_id || undefined,
      name: validatedData.name,
      siret: validatedData.siret || undefined,
      siren: validatedData.siren,
      ape_code: validatedData.ape_code,
      activity_sector: validatedData.activity_sector,
      description: validatedData.description || undefined,
      address: validatedData.address,
      city: validatedData.city,
      postalcode: validatedData.postalcode,
      country: validatedData.country,
      heat_level: validatedData.heat_level,
      status: validatedData.status,
      type: validatedData.type,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      handleValidationError(error);
    }
    logError(error, 'CompanyService/createCompanyRecord');
    throw error;
  }
};

export const updateCompanyRecord = async (id: string, data: any): Promise<void> => {
  // Validation des données d'entrée avec l'ID
  const validatedData = validateUpdateCompanyData({ ...data, id });
  
  await CompanyRepository.update(validatedData.id, validatedData);
};

export const createProspectWithContacts = async (dataModal: unknown): Promise<Company> => {
  try {
    // Validation des données d'entrée
    const validatedData = validateProspectData(dataModal);
    
    // Step 1: Create the prospect company
    const company = await CompanyRepository.create({
      company_id: validatedData.company_id || undefined,
      name: validatedData.name,
      siren: validatedData.siren,
      ape_code: validatedData.ape_code,
      activity_sector: validatedData.activity_sector,
      address: validatedData.address,
      city: validatedData.city,
      postalcode: validatedData.postalcode,
      country: validatedData.country,
      heat_level: validatedData.heat_level,
      status: validatedData.status,
      type: 'prospect',
    });

    // Step 2: Create the user and associate with company
    let user;
    if (validatedData.password) {
      user = await createUser(validatedData.email, validatedData.password);
      if (!user) throw new Error('Failed to create primary contact user');
    } else {
      user = await createUser(validatedData.email);
      if (!user) throw new Error('Failed to create primary contact user');
      
      await sendPasswordResetEmail(validatedData.email);
    }

    const profileData = {
      userId: user.id,
      firstname: validatedData.firstname,
      lastname: validatedData.lastname,
      position: validatedData.position || '',
      phone: validatedData.phone || '',
      email: validatedData.email,
      role: validatedData.role || 'prospect',
      is_primary_contact: true,
    };

    await ProfileRepository.create(profileData);
    await ProfileRepository.associateWithCompany(user.id, company.id);

    // Step 3: Handle additional contacts if provided
    if (validatedData.additionalContacts && validatedData.additionalContacts.length > 0) {
      for (const contact of validatedData.additionalContacts) {
        const additionalUser = await createUser(contact.email);
        if (!additionalUser) throw new Error('Failed to create additional contact user');

        await sendPasswordResetEmail(contact.email);

        const additionalProfileData = {
          userId: additionalUser.id,
          firstname: contact.firstname,
          lastname: contact.lastname,
          position: contact.position || '',
          phone: contact.phone || '',
          email: contact.email,
          role: contact.role || 'prospect',
          is_primary_contact: false,
        };

        await ProfileRepository.create(additionalProfileData);
        await ProfileRepository.associateWithCompany(additionalUser.id, company.id);
      }
    }

    return company;
  } catch (error) {
    console.error('Error creating prospect:', error);
    throw error;
  }
};
