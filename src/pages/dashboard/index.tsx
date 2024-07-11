import { useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { Profile } from '@/types/models';
import AddCompanyModal from '@/components/modals/AddCompanyModal';
import { supabase } from '@/lib/supabaseClient';
import { companySchema } from '@/schemas/company';
import { z } from 'zod';
import { useUser } from '@/context/userContext';
import { useFetchData } from '@/hooks/useFetchData';
import { Folder, folderColumns, profileColumns } from '@/components/DataTableColumns';
import { createCompany } from '@/services/companyService';
import { createUser } from '@/services/userService';
import { createProfile } from '@/services/profileService';
import { associateProfileWithCompany } from '@/services/companyProfileService';

interface HomeProps {
  page: string;
}

type DataModal = z.infer<typeof companySchema>;

const Home: React.FC<HomeProps> = ({ page }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();
  const { companies, profiles, fetchData } = useFetchData(page, user?.id);

  const handleAddButtonClickFolder = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateCompany = async (dataModal: DataModal) => {
    try {
      const companyCreated = await createCompany(dataModal);
      if (!companyCreated) return;
  
      const user = await createUser(dataModal.email);
      if (!user) return;
  
      await createProfile(user.id, dataModal);
      await associateProfileWithCompany(user.id, companyCreated.id);
  
      await supabase.auth.resetPasswordForEmail(dataModal.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/reset-password`
      });
  
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleSearchFolder = () => {
    // todo
  }

  const handleAddButtonClickUser = () => {
    // todo
  };

  const handleSearchUser = () => {
    // todo
  }

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
        <DataTable<Profile>
          data={profiles}
          columns={profileColumns}
          placeholder="Recherche"
          addButtonLabel="Ajouter un utilisateur"
          onAddButtonClick={handleAddButtonClickUser}
          onChangeSearch={handleSearchUser}
        />
      )}
    </div>
  );
};

export default Home;
