import { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { Company, Profile } from '@/types/models';
import AddCompanyModal from '@/components/modals/AddCompanyModal';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { CompanyFormInputs, companySchema } from '@/schemas/company';
import { useUser } from '@/context/userContext';
import { useFetchData } from '@/hooks/useFetchData';
import { folderColumns, profileColumns } from '@/components/DataTableColumns';
import { createCompany, updateCompany } from '@/services/companyService';
import { createUser } from '@/services/userService';
import { createProfile, updateUserProfile } from '@/services/profileService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import AddUserModal from '@/components/modals/AddUserModal';
import { UserFormInputs } from '@/schemas/user';
import { ROLES } from '@/constants/roles';
import EditUserModal from '@/components/modals/EditUserModal';
import EditCompanyModal from '@/components/modals/EditCompanyModal';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

interface HomeProps {
  page: string;
}

const Home: React.FC<HomeProps> = ({ page }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteCompanyOpen, setIsModalDeleteCompanyOpen] = useState(false);
  const [isModalDeleteUserOpen, setIsModalDeleteUserOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { user } = useUser();
  const [searchCompany, setSearchCompany] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const { companies, profiles, fetchData } = useFetchData(page, user?.id, searchCompany, searchUser);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedCompanyIdToDelete, setSelectedCompanyIdToDelete] = useState<string | null>(null);
  const [selectedUserIdToDelete, setSelectedUserIdToDelete] = useState<string | null>(null);

  const handleAddButtonClickFolder = () => setIsModalOpen(true);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateCompany = async (formInputs: CompanyFormInputs) => {
    const companyData = {
      ...formInputs,
      role: 'admin',
      companyId: '',
      description: '',
      siret: ''
    };

    try {
      const companyCreated = await createCompany(companyData);
      if (!companyCreated) return;
  
      const userCreated = await createUser(formInputs.email);
      
      if (!userCreated || typeof userCreated === 'string') {
        return userCreated;
      }
  
      const profileData = {
        ...formInputs,
        userId: userCreated.id
      }
      await createProfile(profileData);
      await associateProfileWithCompany(userCreated.id, companyCreated.id);
  
      await supabase.auth.resetPasswordForEmail(companyData.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`
      });
  
      setIsModalOpen(false);
      await fetchData();
      toast.success(`${companyCreated.name} à bien été ajouté à la liste.`)
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(`Erreur lors de la création de l'entreprise: ${formInputs.companyName}`)
    }
  };

  const handleSearchFolder = (dataSearch: string) => {
    setSearchCompany(dataSearch);
    if (dataSearch.length > 2 || dataSearch.length === 0) {
      fetchData();
    }
  };

  useEffect(() => {
    if (searchCompany === '' || searchUser === '') {
      fetchData();
    }
  }, [searchCompany, searchUser]);

  const handleAddButtonClickUser = () => setIsUserModalOpen(true);

  const handleCloseModalUser = () => setIsUserModalOpen(false);

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    try {
      const result = await createUser(formInputs.email);
      
      if (!result || typeof result === 'string') {
        return result;
      }
  
      const profileData = {
        ...formInputs,
        userId: result.id
      }
      await createProfile(profileData);
  
      await supabase.auth.resetPasswordForEmail(formInputs.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`
      });
  
      setIsUserModalOpen(false);
      fetchData();
      toast.success(`${profileData.firstname} ${profileData.lastname} à bien été ajouté·e à la liste. Un email de confirmation à été envoyé à l'adresse indiquée.`)
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Erreur lors de la création de l'utilisateur: ${formInputs.firstname} ${formInputs.lastname}`)
    }
  };

  const handleSearchUser = (dataSearch: string) => {
    setSearchUser(dataSearch);
    if (dataSearch.length > 3 || dataSearch.length === 0) {
      fetchData();
    }
  };

  const handleEditUser = (userSelected: Profile) => {
    setSelectedUser(userSelected);
    setIsModalOpenEdit(true);
  };

  const handleEditCompany = (companySelected: Company) => {
    setSelectedCompany(companySelected);
    setIsModalOpenEdit(true);
  };

  const handleDeleteCompany = async () => {
    await supabase.from('company').delete().eq('id', selectedCompanyIdToDelete);
    fetchData();
    toast.success("La company a bien été supprimé !");
    closeModalCompany()
  };

  const handleDeleteUser = async () => {
    if (selectedUserIdToDelete) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(selectedUserIdToDelete);

      if (error) {
        toast.error("Error lors de la suppréssion de l'utilisateur")
        return
      }

      fetchData();
      toast.success("l'utilisateur à bien été supprimé !");
      closeModalUser();
    }
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
    setSelectedUser(null);
    setSelectedCompany(null);
  };

  const handleSubmitUser = async (data: Profile) => {
    if (user?.id) {
      const error = await updateUserProfile(data, user.id);
      if (error) {
        console.error('Error updating user profile:', error);
        return;
      }
    }
    handleCloseModalEdit();
    fetchData();
  };

  const handleSubmitCompany = async (data: Company) => {
    await updateCompany(data);
    handleCloseModalEdit();
    fetchData();
  };

  const openModalCompany = (userId: string) => {
    setSelectedCompanyIdToDelete(userId);
    setIsModalDeleteCompanyOpen(true);
  };

  const closeModalCompany = () => {
    setIsModalDeleteCompanyOpen(false);
    setSelectedCompanyIdToDelete(null);
  };

  const openModalUser = (userId: string) => {
    setSelectedUserIdToDelete(userId);
    setIsModalDeleteUserOpen(true);
  };

  const closeModalUser = () => {
    setIsModalDeleteUserOpen(false);
    setSelectedUserIdToDelete(null);
  };
  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <h3 className="text-2xl font-bold mt-5">Espace administrateur</h3>
      </div>
      {page === 'folders' ? (
        <>
          <DataTable<Company>
            data={companies}
            columns={folderColumns(handleEditCompany, openModalCompany)}
            placeholder="Recherche"
            addButtonLabel="Nouveau client"
            onAddButtonClick={handleAddButtonClickFolder}
            onChangeSearch={handleSearchFolder} 
          />
          {selectedCompany && (
            <EditCompanyModal
              isOpen={isModalOpenEdit}
              onRequestClose={handleCloseModalEdit}
              onSubmit={handleSubmitCompany}
              defaultValues={selectedCompany}
            />
          )}
          <AddCompanyModal
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            onSubmit={handleCreateCompany}
          />
          <ConfirmDeleteModal
            isOpen={isModalDeleteCompanyOpen}
            onClose={closeModalCompany}
            onConfirm={handleDeleteCompany}
            message={"Êtes-vous sûr de vouloir supprimer l'entreprise ?"}
          />
        </>
      ) : (
        <>
          <DataTable<Profile>
            data={profiles}
            columns={profileColumns(handleEditUser, openModalUser)}
            placeholder="Recherche"
            addButtonLabel="Ajouter un utilisateur"
            onAddButtonClick={handleAddButtonClickUser}
            onChangeSearch={handleSearchUser} 
          />
          {selectedUser && (
            <EditUserModal
              isOpen={isModalOpenEdit}
              onRequestClose={handleCloseModalEdit}
              onSubmit={handleSubmitUser}
              defaultValues={selectedUser}
            />
          )}
          <AddUserModal
            page={ROLES.SUPER_ADMIN}
            isOpen={isUserModalOpen}
            onRequestClose={handleCloseModalUser}
            onSubmit={handleCreateUser}
          />
          <ConfirmDeleteModal
            isOpen={isModalDeleteUserOpen}
            onClose={closeModalUser}
            onConfirm={handleDeleteUser}
            message={"Êtes-vous sûr de vouloir supprimer l'utilisateur ?"}
          />
        </>
      )}
    </div>
  );
};

export default Home;
