import { supabase } from '@/lib/supabaseClient';
import { Company } from '@/types/models';

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
export const fetchCompaniesWithParentByProfileId = async (profileId: string): Promise<Company[]> => {
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

  const companiesWithParent: Company[] = [];
  for (let { company_id } of companyProfileData) {
    const company = await fetchCompanyById(company_id);
    if (company && company.company_id) {
      companiesWithParent.push(company);
    }
  }

  return companiesWithParent;
};

// Fetch companies by company_id
export const fetchCompaniesByCompanyId = async (companyId: string): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .eq('company_id', companyId);

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
    .eq('company_id', '');

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
    }])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating company:', error);
    return null;
  }

  return data;
};
