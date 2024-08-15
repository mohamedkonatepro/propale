import { useState, useEffect, useCallback } from 'react';
import { Profile } from '@/types/models';
import { fetchAndCategorizeProfiles } from '@/services/companyService';
import { associateProfileWithCompany, removeProfileFromCompany } from '@/services/companyProfileService';

const useProfileManagement = (companyId: string) => {
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [folderUsers, setFolderUsers] = useState<Profile[]>([]);

  const getAndCategorizeProfiles = useCallback(async () => {
    try {
      const { attachedProfiles, unattachedProfiles } = await fetchAndCategorizeProfiles(companyId);
      setAvailableUsers(unattachedProfiles);
      setFolderUsers(attachedProfiles);
    } catch (error) {
      console.error('Error categorizing profiles:', error);
    }
  }, [companyId]);

  const deleteAssociateProfileAndCompany = useCallback(async (userId: string) => {
    try {
      await removeProfileFromCompany(userId, companyId);
      await getAndCategorizeProfiles();
    } catch (error) {
      console.error('Error removing profile association:', error);
    }
  }, [companyId, getAndCategorizeProfiles]);

  const associateProfileAndCompany = useCallback(async (userId: string) => {
    try {
      await associateProfileWithCompany(userId, companyId);
      await getAndCategorizeProfiles();
    } catch (error) {
      console.error('Error associating profile with company:', error);
    }
  }, [companyId, getAndCategorizeProfiles]);

  useEffect(() => {
    getAndCategorizeProfiles();
  }, [getAndCategorizeProfiles]);

  return {
    availableUsers,
    folderUsers,
    deleteAssociateProfileAndCompany,
    associateProfileAndCompany,
  };
};

export default useProfileManagement;
