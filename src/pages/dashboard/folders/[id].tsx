import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import Header from '@/components/layout/Header';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AddFolderModal from '@/components/modals/AddFolderModal';
import AddProspectModal from '@/components/modals/AddProspectModal';
import FoldersTable from '@/components/DataTable/FoldersTable';
import { Company } from '@/types/models';
import { FolderFormInputs } from '@/schemas/folder';
import useCompanies from '@/hooks/useCompanies';
import useCompanyData from '@/hooks/useCompanyData';
import useProspects from '@/hooks/useProspects';

const Folders: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderFormInputs | null>(null);
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { companies, removeCompany, fetchData } = useCompanies(id as string, search);
  const { company, updateCompanyData, createNewCompany } = useCompanyData(id as string);
  const { addProspect } = useProspects(id as string, search);

  const handleOpenModal = (data?: FolderFormInputs) => {
    setIsModalOpen(true);
    setSelectedFolder(data || null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFolder(null);
  };

  const handleCreateFolder = async (data: FolderFormInputs) => {
    if (selectedFolder) {
      const folderData = {
        ...data,
        id: selectedFolder.id,
      };
      await updateCompanyData(folderData);
    } else {
      const folderData = {
        ...data,
        companyId: id as string,
      };
      await createNewCompany(folderData);
    }
    handleCloseModal();
    await fetchData();
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  };

  const openDeleteModal = (folderId: string) => {
    setIsDeleteModalOpen(true);
    setSelectedFolder({ id: folderId } as FolderFormInputs);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedFolder(null);
  };

  const handleDeleteFolder = async () => {
    if (selectedFolder?.id) {
      await removeCompany(selectedFolder.id);
      closeDeleteModal();
      fetchData();
    }
  };

  const openProspectModal = (company: Company) => {
    setSelectedCompany(company);
    setIsProspectModalOpen(true);
  };

  const closeProspectModal = () => {
    setIsProspectModalOpen(false);
  };

  const handleCreateProspect = async (data: any) => {
    await addProspect(data);
    closeProspectModal();
  };

  return (
    <div className="flex-1 p-6">
      <Header title={company?.name} subtitle="Mes dossiers" siren={company?.siren} />
      <FoldersTable
        companies={companies}
        handleOpenModal={handleOpenModal}
        handleSearch={handleSearch}
        openProspectModal={openProspectModal}
        openDeleteModal={openDeleteModal}
      />
      <AddFolderModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={handleCreateFolder}
        defaultValues={selectedFolder}
        role={user?.role}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteFolder}
        message="Êtes-vous sûr de vouloir supprimer ce dossier ?"
      />
      {selectedCompany && (
        <AddProspectModal
          isOpen={isProspectModalOpen}
          onRequestClose={closeProspectModal}
          onSubmit={handleCreateProspect}
          company={selectedCompany}
        />
      )}
    </div>
  );
};

export default Folders;
