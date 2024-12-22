import { useEffect, useState } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { Company, Profile } from '@/types/models';
import AddCompanyModal from '@/components/modals/AddCompanyModal';
import AddUserModal from '@/components/modals/AddUserModal';
import EditUserModal from '@/components/modals/EditUserModal';
import EditCompanyModal from '@/components/modals/EditCompanyModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { useUser } from '@/context/userContext';
import { useFetchEntities } from '@/hooks/useFetchEntities';
import { folderColumns, profileColumns } from '@/components/DataTable/DataTableColumns';
import useEntityManagement from '@/hooks/useEntityManagement';
import { ROLES } from '@/constants/roles';

interface HomeProps {
  page: string;
}

const Home: React.FC<HomeProps> = ({ page }) => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const { companies, profiles, fetchData } = useFetchEntities(page, user?.id, searchQuery);

  useEffect(() => {
    if (searchQuery === '') {
      fetchData();
    }
  }, [searchQuery]);

  const {
    isModalOpen,
    isModalDeleteOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedEntity,
    handleAddButtonClick,
    handleCloseModal,
    handleCreateEntity,
    handleEditEntity,
    handleSubmitEdit,
    openDeleteModal,
    closeModalDelete,
    handleDeleteEntity,
  } = useEntityManagement(page, fetchData);

  const handleSearch = (dataSearch: string) => {
    setSearchQuery(dataSearch);
    if (dataSearch.length > 2 || dataSearch.length === 0) {
      fetchData();
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <h3 className="text-2xl font-medium mt-5">Espace administrateur</h3>
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
