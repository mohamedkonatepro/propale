import { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { Profile } from '@/types/models';
import AddCompanyModal from '@/components/modals/AddCompanyModal';
import { supabase } from '@/lib/supabaseClient';
import { CompanyFormInputs, companySchema } from '@/schemas/company';
import { z } from 'zod';
import { useUser } from '@/context/userContext';
import { useFetchData } from '@/hooks/useFetchData';
import { Folder, folderColumns, profileColumns } from '@/components/DataTableColumns';
import { createCompany } from '@/services/companyService';
import { createUser } from '@/services/userService';
import { createProfile } from '@/services/profileService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import AddUserModal from '@/components/modals/AddUserModal';
import { UserFormInputs } from '@/schemas/user';
import { ROLES } from '@/constants/roles';

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
  
      const user = await createUser(companyData.email);
      if (!user) return;
  
      await createProfile(user.id, companyData);
      await associateProfileWithCompany(user.id, companyCreated.id);
  
      await supabase.auth.resetPasswordForEmail(companyData.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/reset-password`
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
      const user = await createUser(formInputs.email);
      if (!user) return;
  
      await createProfile(user.id, formInputs);
  
      await supabase.auth.resetPasswordForEmail(formInputs.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/reset-password`
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

  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <h3 className="text-2xl font-bold mt-5">Espace administrateur</h3>
      </div>
      {page === 'folders' ? (
        <>
          <DataTable<Folder>
            data={companies}
            columns={folderColumns}
            placeholder="Recherche"
            addButtonLabel="Ajouter une entreprise"
            onAddButtonClick={handleAddButtonClickFolder}
            onChangeSearch={handleSearchFolder} 
          />
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
            columns={profileColumns}
            placeholder="Recherche"
            addButtonLabel="Ajouter un utilisateur"
            onAddButtonClick={handleAddButtonClickUser}
            onChangeSearch={handleSearchUser} 
          />
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
