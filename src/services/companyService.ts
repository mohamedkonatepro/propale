import { supabase } from '@/lib/supabaseClient';
import { Company, CompanyModalData, Profile } from '@/types/models';
import { createUser, sendPasswordResetEmail } from './userService';
import { createProfile, fetchProfilesWithUserDetails } from './profileService';
import { associateProfileWithCompany } from './companyProfileService';
import { ROLES } from '@/constants/roles';

// Fetch company by its ID
export const fetchCompanyById = async (companyId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }

  return data;
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
const findTopMostParentCompany = async (company: Company): Promise<Company> => {
  if (!company.company_id) {
    return company;
  }

  const parentCompany = await fetchCompanyById(company.company_id);
  if (!parentCompany) {
    return company;
  }

  return findTopMostParentCompany(parentCompany);
};

// Fetch the company without a company_id by profile_id
export const fetchCompanyWithoutParentByProfileId = async (profileId: string): Promise<Company | null> => {
  const { data: companies, error: companiesError } = await supabase
    .from('companies_profiles')
    .select('company_id')
    .eq('profile_id', profileId);

  if (companiesError) {
    console.error('Error fetching companies for profile:', companiesError);
    return null;
  }

  if (!companies || companies.length === 0) {
    console.log('No companies found for this profile.');
    return null;
  }

  for (let { company_id } of companies) {
    const company = await fetchCompanyById(company_id);
    if (!company) continue;

    const topMostParentCompany = await findTopMostParentCompany(company);
    if (!topMostParentCompany.company_id) {
      return topMostParentCompany;
    }
  }

  console.log('No company without a parent company_id found.');
  return null;
};

// Fetch companies with a parent by profile_id
export const fetchCompaniesWithParentByProfileId = async (profileId: string, search?: string): Promise<Company[]> => {
  const { data: companyProfileData, error: companyProfileError } = await supabase
    .from('companies_profiles')
    .select('company_id')
    .eq('profile_id', profileId);

  if (companyProfileError) {
    console.error('Error fetching companies for profile:', companyProfileError);
    return [];
  }

  if (!companyProfileData || companyProfileData.length === 0) {
    console.log('No companies found for this profile.');
    return [];
  }

  let companyIds = companyProfileData.map(({ company_id }) => company_id);

  let query = supabase
    .from('company')
    .select('*')
    .in('id', companyIds)
    .not('company_id', 'is', null)
    .neq('company_id', '')
    .is('type', null);

  if (search && search.length >= 3) {
    query = query.or(`name.ilike.%${search}%,siret.ilike.%${search}%`);
  }

  const { data: companiesData, error: companiesError } = await query;

  if (companiesError) {
    console.error('Error fetching company details:', companiesError);
    return [];
  }

  return companiesData;
};

// Fetch companies by company_id
export const fetchCompaniesByCompanyId = async (companyId: string, search?: string): Promise<Company[]> => {
  let query = supabase
    .from('company')
    .select('*')
    .eq('company_id', companyId)
    .is('type', null);

  if (search && search.length >= 3) {
    query = query.or(`name.ilike.%${search}%,siret.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }

  return data;
};

// Fetch all companies without parent
export const fetchAllCompaniesWithoutParent = async (search?: string): Promise<Company[]> => {
  let query = supabase
    .from('company')
    .select('*')
    .eq('company_id', '')
    .is('type', null);

  if (search) {
    query = query.or(`name.ilike.%${search}%,siren.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching companies without parent:', error);
    return [];
  }

  return data;
};

// Create a new company
export const createCompany = async (dataModal: CompanyModalData): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company')
    .insert([{
      company_id: dataModal.companyId,
      prospect_id: '',
      name: dataModal.name,
      siret: dataModal.siret,
      siren: dataModal.siren,
      ape_code: dataModal.ape_code,
      activity_sector: dataModal.activity_sector,
      description: dataModal.description,
      address: dataModal.address,
      city: dataModal.city,
      postalcode: dataModal.postalcode,
      country: dataModal.country,
      heat_level: dataModal.heat_level,
      status: dataModal.status,
      type: dataModal.type,
    }])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating company:', error);
    return null;
  }

  return data;
};

export const updateCompany = async (data: Company) => {
  const { error } = await supabase
    .from('company')
    .update({
      name: data.name,
      siret: data.siret,
      siren: data.siren,
      ape_code: data.ape_code,
      activity_sector: data.activity_sector,
      description: data.description,
      updated_at: new Date().toISOString(),
      address: data.address,
      city: data.city,
      postalcode: data.postalcode,
      country: data.country,
      heat_level: data.heat_level,
      status: data.status,
      type: data.type,
    })
    .eq('id', data.id);

  return error;
};

export const deleteCompany = async (companyId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('company')
    .delete()
    .eq('id', companyId);

  if (error) {
    console.error('Error deleting company:', error);
    return false;
  }

  return true;
};


export const createProspect = async (dataModal: CompanyModalData): Promise<Company | null> => {
  try {
    const data = await createCompany({ ...dataModal, type: 'prospect' });

    if (data) {
      try {
        const user = await createUser(dataModal.email);
        if (!user) throw new Error('Failed to create primary contact user');
        
        await sendPasswordResetEmail(dataModal.email);

        const profileData = {
          userId: user.id,
          firstname: dataModal.firstname,
          lastname: dataModal.lastname,
          position: dataModal.position,
          phone: dataModal.phone,
          email: dataModal.email,
          role: dataModal.role || 'prospect',
          is_primary_contact: true,
        };

        await createProfile(profileData);
        await associateProfileWithCompany(user.id, data.id);

        if (dataModal.additionalContacts) {
          for (const contact of dataModal.additionalContacts) {
            const additionalUser = await createUser(contact.email);
            if (!additionalUser) throw new Error('Failed to create additional contact user');

            await sendPasswordResetEmail(contact.email);

            const additionalProfileData = {
              userId: additionalUser.id,
              firstname: contact.firstname,
              lastname: contact.lastname,
              position: contact.position,
              phone: contact.phone,
              email: contact.email,
              role: contact.role || 'prospect',
              is_primary_contact: false,
            };

            await createProfile(additionalProfileData);
            await associateProfileWithCompany(additionalUser.id, data.id);
          }
        }
        return data;
      } catch (error) {
        console.error('Error creating user, profile, or associating profile with company:', error);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error creating prospect company:', error);
    return null;
  }
};


export const fetchProspects = async (companyId: string, search?: string): Promise<Company[]> => {
  let query = supabase
    .from('company')
    .select('*')
    .eq('company_id', companyId)
    .eq('type', ROLES.PROSPECT);

  if (search) {
    query = query.or(`name.ilike.%${search}%,siren.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching prospects:', error);
    return [];
  }

  return data;
};

export const deleteProspect = async (companyId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('company')
    .delete()
    .eq('id', companyId);

  if (error) {
    console.error('Error deleting prospect:', error);
    return false;
  }

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


export const checkSiretAndCompanyId = async (companyId: string, siret: string) => {
  const { data: companyData, error } = await supabase
    .from('company')
    .select('*')
    .eq('siret', siret);

  if (error) {
    console.error('Erreur lors de la vérification du SIRET:', error);
    return false;
  }

  if (companyData && companyData.length > 0) {
    const isSameCompanyId = companyData.some(
      (company) => company.company_id === companyId);

    if (isSameCompanyId) {
      console.error('Une société avec le même SIRET et company_id existe déjà.');
      return false;
    } else {
      console.warn('Une société avec le même SIRET mais un `company_id` différent existe.');
      return true;
    }
  }

  return true;
};

export const checkSirenAndCompanyId = async (companyId: string, siren: string) => {

  const { data: companyData, error } = await supabase
    .from('company')
    .select('*')
    .eq('siren', siren);

  if (error) {
    console.error('Erreur lors de la vérification du SIREN:', error);
    return false;
  }

  if (companyData && companyData.length > 0) {
    const isSameCompanyId = companyData.some(
      (company) => company.company_id === companyId);

    if (isSameCompanyId) {
      console.error('Une société avec le même SIREN et company_id existe déjà.');
      return false;
    } else {
      console.warn('Une société avec le même SIREN mais un `company_id` différent existe.');
      return true;
    }
  }

  return true;
};

export const countCompaniesByParentId = async (parentId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('company')
    .select('id', { count: 'exact' })
    .eq('company_id', parentId);

  if (error) {
    console.error('Error counting companies:', error);
    return 0;
  }

  return count ?? 0;
};

export const countAllProspectsByCompanyId = async (companyId: string): Promise<number> => {
  // First, get all child companies
  const { data: childCompanies, error: childError } = await supabase
    .from('company')
    .select('id')
    .eq('company_id', companyId);

  if (childError) {
    console.error('Error fetching child companies:', childError);
    return 0;
  }

  // Include the parent company ID in the list
  const allCompanyIds = [companyId, ...childCompanies.map(c => c.id)];

  // Now count all prospects for these companies
  const { count, error } = await supabase
    .from('company')
    .select('id', { count: 'exact' })
    .in('company_id', allCompanyIds)
    .eq('type', 'prospect');

  if (error) {
    console.error('Error counting prospects:', error);
    return 0;
  }

  return count ?? 0;
};

export const fetchProspectByUserId = async (userId: string): Promise<Company | null> => {
  try {
    // Step 1: Find the company associated with the profile
    const { data: companyProfile, error: companyProfileError } = await supabase
      .from('companies_profiles')
      .select('company_id')
      .eq('profile_id', userId)
      .single();

    if (companyProfileError) {
      console.error('Erreur lors de la récupération de la relation company-profile:', companyProfileError);
      return null;
    }

    if (!companyProfile) {
      console.log('Aucune société associée à ce profil');
      return null;
    }

    // Step 2: Retrieve Company Details
    const { data: company, error: companyError } = await supabase
      .from('company')
      .select('*')
      .eq('id', companyProfile.company_id)
      .eq('type', ROLES.PROSPECT)
      .single();

    if (companyError) {
      console.error('Erreur lors de la récupération de la société:', companyError);
      return null;
    }

    if (!company) {
      console.log('Aucune société prospect trouvée pour cet utilisateur');
      return null;
    }

    return company;

  } catch (error) {
    console.error('Erreur inattendue lors de la récupération du prospect:', error);
    return null;
  }
};