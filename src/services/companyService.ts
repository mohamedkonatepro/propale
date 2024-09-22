import { Company, CompanyModalData, Profile } from '@/types/models';
import { fetchProfilesWithUserDetails } from './profileService';

export const fetchCompanyById = async (companyId: string): Promise<Company | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/${companyId}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error('Error fetching company');
  }

  return await response.json();
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/withoutParentByProfileId/${profileId}`, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error('Error fetching company without parent');
  }

  return await response.json();
};

export const fetchCompaniesWithParentByProfileId = async (profileId: string, search?: string): Promise<Company[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/withParentByProfileId/${profileId}?search=${encodeURIComponent(search || '')}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error fetching companies with parent');
  }

  return await response.json();
};

export const fetchCompaniesByCompanyId = async (companyId: string, search?: string): Promise<Company[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/byCompanyId/${companyId}?search=${encodeURIComponent(search || '')}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error fetching companies by companyId');
  }

  return await response.json();
};

export const fetchAllCompaniesWithoutParent = async (search?: string): Promise<Company[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/allWithoutParent?search=${encodeURIComponent(search || '')}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error fetching all companies without parent');
  }

  return await response.json();
};

// Create a new company
export const createCompany = async (dataModal: CompanyModalData): Promise<Company | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataModal }),
  });

  if (!response.ok) {
    throw new Error('Error creating company');
  }

  return await response.json();
};

export const updateCompany = async (data: Company): Promise<boolean> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/update/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error updating company');
  }

  return true;
};

export const deleteCompany = async (companyId: string): Promise<boolean> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/delete/${companyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error deleting company');
  }

  return true;
};

export const createProspect = async (dataModal: CompanyModalData): Promise<Company | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/prospect/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataModal),
  });

  if (!response.ok) {
    throw new Error('Error creating prospect');
  }

  return await response.json();
};

export const fetchProspects = async (companyId: string, search?: string): Promise<Company[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/prospect/fetch?companyId=${companyId}&search=${encodeURIComponent(search || '')}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error fetching prospects');
  }

  return await response.json();
};

export const deleteProspect = async (companyId: string): Promise<boolean> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/prospect/delete/${companyId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error deleting prospect');
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

export const checkSiretAndCompanyId = async (companyId: string, siret: string): Promise<boolean> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/checkSiret?companyId=${companyId}&siret=${siret}`, {
    method: 'GET',
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.message === 'SIRET is valid and not used by another company';
};


export const checkSirenAndCompanyId = async (companyId: string, siren: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/checkSiren?companyId=${companyId}&siren=${siren}`, {
    method: 'GET',
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json();
  return result.message === 'SIREN is valid and not used by another company';
};

export const countCompaniesByParentId = async (parentId: string): Promise<number> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/countByParentId/${parentId}`);

  if (!response.ok) {
    throw new Error('Error counting companies by parentId');
  }

  const { count } = await response.json();
  return count;
};

export const countAllProspectsByCompanyId = async (companyId: string): Promise<number> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/company/countAllProspects/${companyId}`);

  if (!response.ok) {
    throw new Error('Error counting all prospects by companyId');
  }

  const { count } = await response.json();
  return count;
};

export const fetchProspectByUserId = async (userId: string): Promise<Company | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/prospect/byUserId/${userId}`);

  if (!response.ok) {
    throw new Error('Error fetching prospect by userId');
  }

  return await response.json();
};
