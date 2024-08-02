import { useState, useEffect } from 'react';
import { fetchUserAccess, associateProfileWithCompany, removeProfileFromCompany } from '@/services/companyProfileService';
import { toast } from 'react-toastify';
import { Company } from '@/types/models';
import { fetchCompaniesByCompanyId } from '@/services/companyService';

const useUserAccess = (userId: string) => {
  const [userAccess, setUserAccess] = useState<Set<string>>(new Set());
  const [initialFolders, setInitialFolders] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userAccessSet = await fetchUserAccess(userId);
        setUserAccess(userAccessSet);

        const folders = await fetchCompaniesByCompanyId(userId);
        setInitialFolders(folders);
      } catch (err) {
        setError('Erreur lors de la récupération des accès de l\'utilisateur.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const saveManageAccess = async (updatedAccess: Set<string>, selectedUserId: string) => {
    try {
      const currentAccess = await fetchUserAccess(selectedUserId);

      const accessToAdd = new Set(Array.from(updatedAccess).filter(x => !currentAccess.has(x)));
      const accessToRemove = new Set(Array.from(currentAccess).filter(x => !updatedAccess.has(x)));

      for (let companyId of Array.from(accessToAdd)) {
        await associateProfileWithCompany(selectedUserId, companyId);
      }

      for (let companyId of Array.from(accessToRemove)) {
        await removeProfileFromCompany(selectedUserId, companyId);
      }

      setUserAccess(updatedAccess);
      toast.success("Les accès ont été mis à jour avec succès.");
    } catch (err) {
      setError('Erreur lors de la mise à jour des accès.');
    }
  };

  return { userAccess, setUserAccess, initialFolders, loading, error, saveManageAccess };
};

export default useUserAccess;
