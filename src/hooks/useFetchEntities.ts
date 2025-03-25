import { fetchAllCompaniesWithoutParent } from '@/services/companyService';
import { fetchProfilesWithRoleSuperAdmin } from '@/services/userService';
import { Company, Profile } from '@/types/models';
import { useEffect, useState, useCallback, useRef } from 'react';

export const useFetchEntities = (page: string, userId?: string, searchCompany?: string, searchUser?: string) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  // ✅ Référence vers le contrôleur d'abort actuel
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // ✅ Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // ✅ Créer un nouveau contrôleur pour cette requête
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

  // ✅ Cleanup: Annuler les requêtes en cours au unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { companies, profiles, fetchData };
};
