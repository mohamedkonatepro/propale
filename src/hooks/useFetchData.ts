import { fetchAllCompaniesWithoutParent } from '@/services/companyService';
import { fetchProfilesWithRoleSuperAdmin } from '@/services/userService';
import { Company, Profile } from '@/types/models';
import { useEffect, useState } from 'react';

export const useFetchData = (page: string, userId?: string, searchCompany?: string, searchUser?: string) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const fetchData = async () => {
    try {
      if (page === 'users') {
        const profilesData = await fetchProfilesWithRoleSuperAdmin(searchUser);
        if (profilesData) setProfiles(profilesData);
      } else {
        const companiesData = await fetchAllCompaniesWithoutParent(searchCompany);
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, userId, searchCompany, searchUser]);

  return { companies, profiles, fetchData };
};
