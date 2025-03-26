import { fetchAllCompaniesWithoutParent } from '@/services/companyService';
import { fetchProfilesWithRoleSuperAdmin } from '@/services/userService';
import { Company, Profile } from '@/types/models';
import { useEffect, useState, useCallback, useRef } from 'react';

export const useFetchEntities = (page: string, userId?: string, searchCompany?: string, searchUser?: string) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  // ✅ Reference to the current abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // ✅ Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // ✅ Create a new controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      if (page === 'users') {
        const profilesData = await fetchProfilesWithRoleSuperAdmin(searchUser);
        if (profilesData && !abortController.signal.aborted) {
          setProfiles(profilesData);
        }
      } else {
        const companiesData = await fetchAllCompaniesWithoutParent(searchCompany);
        if (!abortController.signal.aborted) {
          setCompanies(companiesData);
        }
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('Error fetching data:', error);
      }
    }
  }, [page, searchCompany, searchUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Cleanup: Cancel ongoing requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { companies, profiles, fetchData };
};
