import { useState } from 'react';
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
import { deleteUserAuth } from '@/services/userService';
import useModalState from '@/hooks/useModalState';

const Users: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  const { company } = useCompanyData(id as string);
  const { profiles, updateProfile, createNewUser, fetchData } = useProfiles(id as string, searchUser);
  const { userAccess, setUserAccess, initialFolders, saveManageAccess: saveManageAccessOriginal } = useUserAccess(selectedUser?.id || '', id as string);

  const { 
    isModalOpen: isAddUserModalOpen, 
    openModal: openAddUserModal, 
    closeModal: closeAddUserModal 
  } = useModalState();

  const { 
    isModalOpen: isEditUserModalOpen, 
    openModal: openEditUserModal, 
    closeModal: closeEditUserModal 
  } = useModalState();

  const { 
    isModalOpen: isDeleteUserModalOpen, 
    openModal: openDeleteUserModal, 
    closeModal: closeDeleteUserModal 
  } = useModalState();

  const { 
    isModalOpen: isManageAccessModalOpen, 
    openModal: openManageAccessModal, 
    closeModal: closeManageAccessModal 
  } = useModalState();

  const handleEditUser = (userSelected: Profile) => {
    setSelectedUser(userSelected);
    openEditUserModal();
  };

  const handleSubmitEdit = async (data: Profile) => {
    if (user?.id) {
      await updateProfile(data, user.id);
    }
    closeEditUserModal();
    await fetchData();
  };

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    await createNewUser(formInputs, id as string);
    closeAddUserModal();
    fetchData();
  };

  const handleDeleteUser = async () => {
    if (!userIdToDelete) return;

    const { error } = await deleteUserAuth(userIdToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      return;
    }

    toast.success("L'utilisateur a bien été supprimé !");
    closeDeleteUserModal();
    fetchData();
  };

  const openManageAccessModalHandler = async (user: Profile) => {
    setSelectedUser(user);
    const userAccessSet = await fetchUserAccess(user.id);
    setUserAccess(userAccessSet);
    openManageAccessModal();
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
        handleSearch={setSearchUser}
        handleAddButtonClick={openAddUserModal}
        handleEditUser={handleEditUser}
        openDeleteModal={(userId) => { setUserIdToDelete(userId); openDeleteUserModal(); }}
        openManageAccessModal={openManageAccessModalHandler}
      />
      {selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onRequestClose={closeEditUserModal}
          onSubmit={handleSubmitEdit}
          defaultValues={selectedUser}
        />
      )}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onRequestClose={closeAddUserModal}
        onSubmit={handleCreateUser}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteUserModalOpen}
        onClose={closeDeleteUserModal}
        onConfirm={handleDeleteUser}
        message={"Êtes-vous sûr de vouloir supprimer l'utilisateur ?"}
      />
      {selectedUser && (
        <ManageAccessModal
          isOpen={isManageAccessModalOpen}
          onClose={closeManageAccessModal}
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
