import { useState } from 'react';
import { toast } from 'react-toastify';
import { Company, Profile } from '@/types/models';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { createCompany, updateCompany } from '@/services/companyService';
import { createUser, sendPasswordResetEmail } from '@/services/userService';
import { createProfile, updateUserProfile } from '@/services/profileService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import { CompanyFormInputs } from '@/schemas/company';
import { UserFormInputs } from '@/schemas/user';

const useEntityManagement = (page: string, fetchData: () => void) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Profile | Company | null>(null);
  const [entityToDeleteId, setEntityToDeleteId] = useState<string | null>(null);

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
      if (!userCreated || typeof userCreated === 'string') {
        return userCreated;
      }

      const companyCreated = await createCompany(companyData);
      if (!companyCreated) return;

      const profileData = { ...formInputs, userId: userCreated.id };
      await createProfile(profileData);
      await associateProfileWithCompany(userCreated.id, companyCreated.id);

      await sendPasswordResetEmail(companyData.email);
      setIsModalOpen(false);
      await fetchData();
      toast.success(`${companyCreated.name} a bien été ajouté à la liste.`);
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(`Erreur lors de la création de l'entreprise: ${formInputs.name}`);
    }
  };

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    try {
      const result = await createUser(formInputs.email);
      if (!result || typeof result === 'string') {
        return result;
      }

      const profileData = { ...formInputs, userId: result.id };
      await createProfile(profileData);
      await sendPasswordResetEmail(formInputs.email);

      setIsModalOpen(false);
      fetchData();
      toast.success(`${profileData.firstname} ${profileData.lastname} a bien été ajouté·e à la liste.`);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Erreur lors de la création de l'utilisateur: ${formInputs.firstname} ${formInputs.lastname}`);
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
      const error = await updateUserProfile(profileData, profileData.id);
      if (error) {
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
      await supabase.from('company').delete().eq('id', entityToDeleteId);
      toast.success("L'entreprise a bien été supprimée !");
    } else if (entityToDeleteId) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(entityToDeleteId);
      if (error) {
        toast.error("Erreur lors de la suppression de l'utilisateur");
        return;
      }
      toast.success("L'utilisateur a bien été supprimé !");
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
  };
};

export default useEntityManagement;
