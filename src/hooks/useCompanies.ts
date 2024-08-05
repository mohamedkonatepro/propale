import { useState, useEffect } from 'react';
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = user?.role === ROLES.SALES
        ? await fetchCompaniesWithParentByProfileId(user.id, search)
        : await fetchCompaniesByCompanyId(companyId, search);
      setCompanies(data);
    } catch (err) {
      setError('Erreur lors de la récupération des dossiers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, search, user]);

  const removeCompany = async (companyId: string) => {
    try {
      await deleteCompany(companyId);
      const profiles = await fetchProfilesWithUserDetails(companyId);
      for (const profile of profiles) {
        await deleteUserAuth(profile.id);
      }
      setCompanies(companies.filter(company => company.id !== companyId));
      toast.success("Le dossier a bien été supprimé !");
    } catch (err) {
      setError('Erreur lors de la suppression du dossier.');
    }
  };

  return { companies, loading, error, removeCompany, fetchData };
};

export default useCompanies;
