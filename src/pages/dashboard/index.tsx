import { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { Company, Profile } from '@/types/models';
import AddCompanyModal from '@/components/modals/AddCompanyModal';
import { supabase } from '@/lib/supabaseClient';
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

interface HomeProps {
  page: string;
}

const Home: React.FC<HomeProps> = ({ page }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { user } = useUser();
  const [searchCompany, setSearchCompany] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const { companies, profiles, fetchData } = useFetchData(page, user?.id, searchCompany, searchUser);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

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
  
      const userCreated = await createUser(companyData.email);
      if (!userCreated) return;
  
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
    } catch (error) {
      console.error('Error creating company:', error);
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
      const userCreated = await createUser(formInputs.email);
      if (!userCreated) return;
  
      const profileData = {
        ...formInputs,
        userId: userCreated.id
      }
      await createProfile(profileData);
  
      await supabase.auth.resetPasswordForEmail(formInputs.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`
      });
  
      setIsUserModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
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
  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <h3 className="text-2xl font-bold mt-5">Espace administrateur</h3>
      </div>
      {page === 'folders' ? (
        <>
          <DataTable<Company>
            data={companies}
            columns={folderColumns(handleEditCompany)}
            placeholder="Recherche"
            addButtonLabel="Ajouter une entreprise"
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
        </>
      ) : (
        <>
          <DataTable<Profile>
            data={profiles}
            columns={profileColumns(handleEditUser)}
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
        </>
      )}
    </div>
  );
};

export default Home;
