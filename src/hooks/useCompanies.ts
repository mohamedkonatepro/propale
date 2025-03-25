import { useState, useEffect, useCallback, useRef } from 'react';
import { Company } from '@/types/models';
import { fetchCompaniesByCompanyId, fetchCompaniesWithParentByProfileId, deleteCompany } from '@/services/companyService';
import { useUser } from '@/context/userContext';
import { ROLES } from '@/constants/roles';
import { toast } from 'react-toastify';
import { fetchProfilesWithUserDetails } from '@/services/profileService';
import { deleteUserAuth } from '@/services/userService';

const useCompanies = (companyId: string, search: string) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  
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
    
    setLoading(true);
    setError(null);
    
    try {
      const data = user?.role === ROLES.SALES
        ? await fetchCompaniesWithParentByProfileId(user.id, search)
        : await fetchCompaniesByCompanyId(companyId, search);
      
      // ✅ Vérifier si la requête n'a pas été annulée
      if (!abortController.signal.aborted) {
        setCompanies(data);
      }
    } catch (err) {
      // ✅ Ignorer les erreurs d'annulation
      if (!abortController.signal.aborted) {
        setError('Erreur lors de la récupération des dossiers.');
      }
    } finally {
      // ✅ Réinitialiser le loading seulement si ce n'est pas annulé
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [companyId, search, user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  // ✅ Cleanup: Annuler les requêtes en cours au unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const removeCompany = async (companyId: string) => {
    try {
      await deleteCompany(companyId);
      setCompanies(companies.filter(company => company.id !== companyId));
      toast.success("Le dossier a bien été supprimé !");
    } catch (err) {
      setError('Erreur lors de la suppression du dossier.');
    }
  };

  return { companies, loading, error, removeCompany, fetchData };
};

export default useCompanies;
