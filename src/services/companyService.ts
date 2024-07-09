import { supabase } from '@/lib/supabaseClient';
import { Company } from '../types/models';

// Function to fetch company by its ID
export const fetchCompanyById = async (companyId: string) => {
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

// Function to recursively find the top-most parent company without a company_id
const findTopMostParentCompany = async (company: Company) => {
  if (!company.company_id) {
    return company;
  }

  const parentCompany = await fetchCompanyById(company.company_id);
  if (!parentCompany) {
    return company;
  }

  return findTopMostParentCompany(parentCompany);
};

// Function to fetch the company without a company_id by profile_id
export const fetchCompanyWithoutParentByProfileId = async (profileId: string) => {
  // Fetch the companies associated with the profile
  const { data: companies, error: companiesError } = await supabase
    .from('companies_profiles')
    .select('company_id')
    .eq('profile_id', profileId);

  if (companiesError) {
    console.error('Error fetching companies for profile:', companiesError);
    return null;
  }

  if (companies.length === 0) {
    console.log('No companies found for this profile.');
    return null;
  }

  // Iterate through the companies to find the one without a company_id
  for (let { company_id } of companies) {
    const company = await fetchCompanyById(company_id);
    if (!company) {
      continue;
    }

    const topMostParentCompany = await findTopMostParentCompany(company);
    if (!topMostParentCompany.company_id) {
      return topMostParentCompany;
    }
  }

  console.log('No company without a parent company_id found.');
  return null;
};

export const fetchCompaniesWithParentByProfileId = async (profileId: string) => {
  // Fetch the companies associated with the profile
  const { data: companyProfileData, error: companyProfileError } = await supabase
    .from('companies_profiles')
    .select('company_id')
    .eq('profile_id', profileId);

  if (companyProfileError) {
    console.error('Error fetching companies for profile:', companyProfileError);
    return [];
  }

  if (companyProfileData.length === 0) {
    console.log('No companies found for this profile.');
    return [];
  }

  // Fetch companies with a company_id
  const companiesWithParent = [];
  for (let { company_id } of companyProfileData) {
    const company = await fetchCompanyById(company_id);
    if (company && company.company_id) {
      companiesWithParent.push(company);
    }
  }

  return companiesWithParent;
};

export const fetchCompaniesByCompanyId = async (companyId: string) => {
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
