import { useState } from 'react';
import { toast } from 'react-toastify';
import { Company, Profile } from '@/types/models';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { createCompany, deleteCompany, fetchCompaniesByCompanyId, updateCompany } from '@/services/companyService';
import { createUser, deleteUserAuth, sendPasswordResetEmail } from '@/services/userService';
import { createProfile, fetchProfilesWithUserDetails, updateUserProfile } from '@/services/profileService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import { CompanyFormInputs } from '@/schemas/company';
import { UserFormInputs } from '@/schemas/user';

const useEntityManagement = (page: string, fetchData: () => void) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Profile | Company | null>(null);
  const [entityToDeleteId, setEntityToDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddButtonClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateEntity = async (formInputs: CompanyFormInputs | UserFormInputs) => {
    if (page === 'folders') {
      return await handleCreateCompany(formInputs as CompanyFormInputs);
    } else {
      return await handleCreateUser(formInputs as UserFormInputs);
    }
  };

  const handleCreateCompany = async (formInputs: CompanyFormInputs) => {
    const companyData = { ...formInputs, role: 'admin', companyId: '', description: '', siret: '' };

    try {
      const userCreated = await createUser(formInputs.email);
      if (!userCreated) throw new Error('Failed to create user');

      const companyCreated = await createCompany(companyData);
      if (!companyCreated) return;

      const profileData = { ...formInputs, userId: userCreated.id };
      await createProfile(profileData);
      await associateProfileWithCompany(userCreated.id, companyCreated.id);

      await sendPasswordResetEmail(companyData.email);
      setIsModalOpen(false);
      await fetchData();
      toast.success(`${companyCreated.name} has been successfully added to the list.`);
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(`Error creating the company: ${formInputs.name}`);
    }
  };

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    try {
      const user = await createUser(formInputs.email);
      if (!user) throw new Error('Failed to create user');

      const profileData = { ...formInputs, userId: user.id };
      await createProfile(profileData);
      await sendPasswordResetEmail(formInputs.email);

      setIsModalOpen(false);
      fetchData();
      toast.success(`${profileData.firstname} ${profileData.lastname} has been successfully added to the list.`);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Error creating the user: ${formInputs.firstname} ${formInputs.lastname}`);
    }
  };

  const handleEditEntity = (entity: Profile | Company) => {
    setSelectedEntity(entity);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (data: Profile | Company) => {
    if (page === 'folders') {
      await updateCompany(data as Company);
    } else {
      const profileData = data as Profile;
      try {
        await updateUserProfile(profileData, profileData.id);
      } catch (error) {
        console.error('Error updating user profile:', error);
        return;
      }
    }
    setIsEditModalOpen(false);
    setSelectedEntity(null);
    fetchData();
  };

  const openDeleteModal = (id: string) => {
    setEntityToDeleteId(id);
    setIsModalDeleteOpen(true);
  };

  const closeModalDelete = () => {
    setIsModalDeleteOpen(false);
    setEntityToDeleteId(null);
  };

  const handleDeleteEntity = async () => {
    if (page === 'folders' && entityToDeleteId) {
      await deleteCompany(entityToDeleteId);
      toast.success("The company has been successfully deleted!");
    } else if (entityToDeleteId) {
      const { error } = await deleteUserAuth(entityToDeleteId);
      if (error) {
        toast.error("Error deleting the user");
        return;
      }
      toast.success("The user has been successfully deleted!");
    }
    fetchData();
    closeModalDelete();
  };

  return {
    isModalOpen,
    setIsModalOpen,
    isModalDeleteOpen,
    isEditModalOpen,
    selectedEntity,
    handleAddButtonClick,
    handleCloseModal,
    handleCreateEntity,
    handleEditEntity,
    handleSubmitEdit,
    openDeleteModal,
    closeModalDelete,
    handleDeleteEntity,
    setIsEditModalOpen,
    error,
  };
};

export default useEntityManagement;
