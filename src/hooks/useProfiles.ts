import { useState, useEffect } from 'react';
import { Profile } from '@/types/models';
import { fetchProfilesWithUserDetails, updateUserProfile, createProfile, fetchProfileCountByProfileId } from '@/services/profileService';
import { createUser, sendPasswordResetEmail } from '@/services/userService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import { toast } from 'react-toastify';
import { UserFormInputs } from '@/schemas/user';

const useProfiles = (companyId: string, search: string) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [foldersCount, setFoldersCount] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const profileData = await fetchProfilesWithUserDetails(companyId, search);
      setProfiles(profileData);

      const folderCounts: { [key: string]: number } = {};
      for (const profile of profileData) {
        const count = await fetchProfileCountByProfileId(profile.id);
        folderCounts[profile.id] = count - 1;
      }
      setFoldersCount(folderCounts);
    } catch (err) {
      setError('Erreur lors de la récupération des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [companyId, search]);

  const updateProfile = async (data: Profile, userId: string) => {
    try {
      await updateUserProfile(data, userId);
      toast.success(`${data.firstname} ${data.lastname} à bien été modifié dans la liste.`);
    } catch (err) {
      setError('Erreur lors de la modification de l\'utilisateur.');
    }
  };

  const createNewUser = async (formInputs: UserFormInputs, companyId: string) => {
    try {
      const result = await createUser(formInputs.email, formInputs.password);
      if (!result || typeof result === 'string') {
        return result;
      }

      const profileData = {
        ...formInputs,
        userId: result.id,
      };
      await createProfile(profileData);
      await associateProfileWithCompany(result.id, companyId);

      await sendPasswordResetEmail(formInputs.email);
      toast.success(`${profileData.firstname} ${profileData.lastname} à bien été ajouté·e à la liste. Un email de confirmation à été envoyé à l'adresse indiquée.`);
    } catch (err) {
      setError('Erreur lors de la création de l\'utilisateur.');
    }
  };

  return { profiles, foldersCount, loading, error, updateProfile, createNewUser, fetchData };
};

export default useProfiles;
