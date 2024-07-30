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
import { createUser, sendPasswordResetEmail } from '@/services/userService';
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
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Profile | Company | null>(null);
  const [entityToDeleteId, setEntityToDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { companies, profiles, fetchData } = useFetchData(page, user?.id, searchQuery);

  useEffect(() => {
    if (searchQuery === '') {
      fetchData();
    }
  }, [searchQuery]);

  const handleAddButtonClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSearch = (dataSearch: string) => {
    setSearchQuery(dataSearch);
    if (dataSearch.length > 2 || dataSearch.length === 0) {
      fetchData();
    }
  };

  const handleCreateEntity = async (formInputs: CompanyFormInputs | UserFormInputs) => {
    if (page === 'folders') {
      return await handleCreateCompany(formInputs as CompanyFormInputs);
    } else {
      return await handleCreateUser(formInputs as UserFormInputs);
    }
  };

  const handleCreateCompany = async (formInputs: CompanyFormInputs) => {
    const companyData = {
      ...formInputs,
      role: 'admin',
      companyId: '',
      description: '',
      siret: ''
    };

    try {
      const userCreated = await createUser(formInputs.email);
      if (!userCreated || typeof userCreated === 'string') {
        return userCreated;
      }

      const companyCreated = await createCompany(companyData);
      if (!companyCreated) return;

      const profileData = {
        ...formInputs,
        userId: userCreated.id
      };
      await createProfile(profileData);
      await associateProfileWithCompany(userCreated.id, companyCreated.id);

      await sendPasswordResetEmail(companyData.email);


      setIsModalOpen(false);
      await fetchData();
      toast.success(`${companyCreated.name} a bien été ajouté à la liste.`);
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(`Erreur lors de la création de l'entreprise: ${formInputs.companyName}`);
    }
  };

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    try {
      const result = await createUser(formInputs.email);
      if (!result || typeof result === 'string') {
        return result;
      }

      const profileData = {
        ...formInputs,
        userId: result.id
      };
      await createProfile(profileData);

      await sendPasswordResetEmail(formInputs.email);

      setIsModalOpen(false);
      fetchData();
      toast.success(`${profileData.firstname} ${profileData.lastname} a bien été ajouté·e à la liste. Un email de confirmation a été envoyé à l'adresse indiquée.`);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Erreur lors de la création de l'utilisateur: ${formInputs.firstname} ${formInputs.lastname}`);
    }
  };

  const handleEditEntity = (entity: Profile | Company) => {
    setSelectedEntity(entity);
    setIsEditModalOpen(true);
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

  const closeModalDelete = () => {
    setIsModalDeleteOpen(false);
    setEntityToDeleteId(null);
  };

  const handleSubmitEdit = async (data: Profile | Company) => {
    if (page === 'folders') {
      await updateCompany(data as Company);
    } else {
      if (user?.id) {
        const error = await updateUserProfile(data as Profile, user.id);
        if (error) {
          console.error('Error updating user profile:', error);
          return;
        }
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

  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <h3 className="text-2xl font-bold mt-5">Espace administrateur</h3>
      </div>
      {page === 'folders' ? (
        <>
          <DataTable<Company>
            data={companies}
            columns={folderColumns(handleEditEntity, openDeleteModal)}
            placeholder="Recherche"
            addButtonLabel="Nouveau client"
            onAddButtonClick={handleAddButtonClick}
            onChangeSearch={handleSearch}
          />
          {selectedEntity && (
            <EditCompanyModal
              isOpen={isEditModalOpen}
              onRequestClose={() => setIsEditModalOpen(false)}
              onSubmit={handleSubmitEdit}
              defaultValues={selectedEntity as Company}
            />
          )}
          <AddCompanyModal
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            onSubmit={handleCreateEntity}
          />
          <ConfirmDeleteModal
            isOpen={isModalDeleteOpen}
            onClose={closeModalDelete}
            onConfirm={handleDeleteEntity}
            message={"Êtes-vous sûr de vouloir supprimer l'entreprise ?"}
          />
        </>
      ) : (
        <>
          <DataTable<Profile>
            data={profiles}
            columns={profileColumns(handleEditEntity, openDeleteModal)}
            placeholder="Recherche"
            addButtonLabel="Ajouter un utilisateur"
            onAddButtonClick={handleAddButtonClick}
            onChangeSearch={handleSearch}
          />
          {selectedEntity && (
            <EditUserModal
              isOpen={isEditModalOpen}
              onRequestClose={() => setIsEditModalOpen(false)}
              onSubmit={handleSubmitEdit}
              defaultValues={selectedEntity as Profile}
            />
          )}
          <AddUserModal
            page={ROLES.SUPER_ADMIN}
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            onSubmit={handleCreateEntity}
          />
          <ConfirmDeleteModal
            isOpen={isModalDeleteOpen}
            onClose={closeModalDelete}
            onConfirm={handleDeleteEntity}
            message={"Êtes-vous sûr de vouloir supprimer l'utilisateur ?"}
          />
        </>
      )}
    </div>
  );
};

export default Home;
