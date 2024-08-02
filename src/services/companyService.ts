import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/types/models';
import { createUser, sendPasswordResetEmail } from './userService';
import { createProfile } from './profileService';
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
    .eq('profile_id', profileId)
    .is('type', null);

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
    .eq('profile_id', profileId)
    .is('type', null);

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
export const createCompany = async (dataModal: any): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('company')
    .insert([{
      company_id: dataModal.companyId,
      prospect_id: '',
      name: dataModal.companyName,
      siret: dataModal.siret,
      siren: dataModal.siren,
      ape_code: dataModal.apeCode,
      activity_sector: dataModal.activitySector,
      description: dataModal.description,
      address: dataModal.address,
      city: dataModal.city,
      postalcode: dataModal.postalcode,
      country: dataModal.country,
      heat_level: dataModal.heatLevel,
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

export const updateCompany = async (data: any) => {
  const { error } = await supabase
    .from('company')
    .update({
      name: data.companyName,
      siret: data.siret,
      siren: data.siren,
      ape_code: data.apeCode,
      activity_sector: data.activitySector,
      description: data.description,
      updated_at: new Date().toISOString(),
      address: data.address,
      city: data.city,
      postalcode: data.postalcode,
      country: data.country,
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


export const createProspect = async (dataModal: any): Promise<Company | null> => {
  const data = await createCompany({...dataModal, type: 'prospect'});

  if (data) {
    const user = await createUser(dataModal.email);
    if (typeof user === 'string' || !user) {
      return null;
    }

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

    await associateProfileWithCompany(user.id, data.id)
    for (const contact of dataModal.additionalContacts) {
      const user = await createUser(contact.email);
      if (typeof user === 'string' || !user) {
        return null;
      }

      await sendPasswordResetEmail(contact.email);

      const profileData = {
        userId: user.id,
        firstname: contact.firstname,
        lastname: contact.lastname,
        position: contact.position,
        phone: contact.phone,
        email: contact.email,
        role: contact.role || 'prospect',
        is_primary_contact: false,
      };
      await createProfile(profileData);

      await associateProfileWithCompany(user.id, data.id)
    }

    return data;
  }
  return data
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