import { useState, useEffect } from 'react';
import { fetchUserAccess, associateProfileWithCompany, removeProfileFromCompany } from '@/services/companyProfileService';
import { toast } from 'react-toastify';
import { Company } from '@/types/models';
import { fetchCompaniesByCompanyId } from '@/services/companyService';

const useUserAccess = (userId: string, companyId?: string) => {
  const [userAccess, setUserAccess] = useState<Set<string>>(new Set());
  const [initialFolders, setInitialFolders] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userId) {
          const userAccessSet = await fetchUserAccess(userId);
          setUserAccess(userAccessSet);
        }

        if (companyId) {
          const folders = await fetchCompaniesByCompanyId(companyId);
          setInitialFolders(folders);
        }
      } catch (err) {
        setError('Error retrieving user access.');
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

      // ✅ OPTIMIZED VERSION - Parallel operations instead of sequential
      const addPromises = Array.from(accessToAdd).map(companyId => 
        associateProfileWithCompany(selectedUserId, companyId)
      );
      
      const removePromises = Array.from(accessToRemove).map(companyId => 
        removeProfileFromCompany(selectedUserId, companyId)
      );

      // Execute all operations in parallel
      await Promise.all([...addPromises, ...removePromises]);

      setUserAccess(updatedAccess);
      toast.success("Access has been successfully updated.");
    } catch (err) {
      setError('Error updating access.');
    }
  };

  return { userAccess, setUserAccess, initialFolders, loading, error, saveManageAccess };
};

export default useUserAccess;
