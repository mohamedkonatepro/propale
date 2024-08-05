import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import Header from '@/components/layout/Header';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AddUserModal from '@/components/modals/AddUserModal';
import EditUserModal from '@/components/modals/EditUserModal';
import ManageAccessModal from '@/components/modals/ManageAccessModal';
import UsersTable from '@/components/DataTable/UsersTable';
import { Profile } from '@/types/models';
import { UserFormInputs } from '@/schemas/user';
import { toast } from 'react-toastify';
import useCompanyData from '@/hooks/useCompanyData';
import useProfiles from '@/hooks/useProfiles';
import useUserAccess from '@/hooks/useUserAccess';
import { fetchUserAccess } from '@/services/companyProfileService';
import { supabase } from '@/lib/supabaseClient';
import { deleteUserAuth } from '@/services/userService';

const Users: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [searchUser, setSearchUser] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [isManageAccessModalOpen, setIsManageAccessModalOpen] = useState(false);

  const { company } = useCompanyData(id as string);
  const { profiles, foldersCount, updateProfile, createNewUser, fetchData } = useProfiles(id as string, searchUser);
  const { userAccess, setUserAccess, initialFolders, saveManageAccess: saveManageAccessOriginal } = useUserAccess(selectedUser?.id || '', id as string);

  const handleEditUser = (userSelected: Profile) => {
    setSelectedUser(userSelected);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmitEdit = async (data: Profile) => {
    if (user?.id) {
      await updateProfile(data, user.id);
    }
    handleCloseEditModal();
    await fetchData();
  };

  const handleAddButtonClick = () => setIsModalOpen(true);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSearch = (dataSearch: string) => setSearchUser(dataSearch);

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    await createNewUser(formInputs, id as string);
    setIsModalOpen(false);
    fetchData();
  };

  const openDeleteModal = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserIdToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userIdToDelete) return;

    const { error } = await deleteUserAuth(userIdToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      return;
    }

    toast.success("L'utilisateur a bien été supprimé !");
    closeDeleteModal();
    fetchData();
  };

  const openManageAccessModal = async (user: Profile) => {
    setSelectedUser(user);
    const userAccessSet = await fetchUserAccess(user.id);
    setUserAccess(userAccessSet);
    setIsManageAccessModalOpen(true);
  };

  const saveManageAccess = async (accessData: any) => {
    if (selectedUser) {
      await saveManageAccessOriginal(accessData, selectedUser.id);
      fetchData();
    }
  };

  return (
    <div className="flex-1 p-6">
      <Header title={company?.name} subtitle="Utilisateurs" siren={company?.siren} />
      <UsersTable
        profiles={profiles}
        foldersCount={foldersCount}
        handleSearch={handleSearch}
        handleAddButtonClick={handleAddButtonClick}
        handleEditUser={handleEditUser}
        openDeleteModal={openDeleteModal}
        openManageAccessModal={openManageAccessModal}
      />
      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onRequestClose={handleCloseEditModal}
          onSubmit={handleSubmitEdit}
          defaultValues={selectedUser}
        />
      )}
      <AddUserModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={handleCreateUser}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        message={"Êtes-vous sûr de vouloir supprimer l'utilisateur ?"}
      />
      {selectedUser && (
        <ManageAccessModal
          isOpen={isManageAccessModalOpen}
          onClose={() => setIsManageAccessModalOpen(false)}
          user={selectedUser}
          initialFolders={initialFolders}
          userAccess={userAccess}
          onSave={saveManageAccess}
        />
      )}
    </div>
  );
};

export default Users;
