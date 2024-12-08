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
import useModalState from '@/hooks/useModalState';
import { CompanyFormInputs } from '@/schemas/company';

const Folders: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [search, setSearch] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<FolderFormInputs | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { companies, removeCompany, fetchData } = useCompanies(id as string, search);
  const { company, updateCompanyData, createNewCompany } = useCompanyData(id as string);
  const { addProspect } = useProspects(id as string, search);

  const { 
    isModalOpen: isFolderModalOpen, 
    openModal: openFolderModal, 
    closeModal: closeFolderModal 
  } = useModalState();

  const { 
    isModalOpen: isDeleteModalOpen, 
    openModal: openDeleteModal, 
    closeModal: closeDeleteModal 
  } = useModalState();

  const { 
    isModalOpen: isProspectModalOpen, 
    openModal: openProspectModal, 
    closeModal: closeProspectModal 
  } = useModalState();

  const handleOpenModal = (data?: FolderFormInputs) => {
    setSelectedFolder(data || null);
    openFolderModal();
  };

  const handleCreateFolder = async (data: FolderFormInputs) => {
    if (selectedFolder) {
      await updateCompanyData({ ...data, id: selectedFolder.id });
    } else {
      await createNewCompany({ ...data, companyId: id as string });
    }
    closeFolderModal();
    fetchData();
  };

  const handleDeleteFolder = async () => {
    if (selectedFolder?.id) {
      await removeCompany(selectedFolder.id);
      closeDeleteModal();
      fetchData();
    }
  };

  const handleCreateProspect = async (data: CompanyFormInputs) => {
    await addProspect(data);
    closeProspectModal();
  };

  return (
    <div className="flex-1 p-6">
      <Header title={company?.name} subtitle="Mes dossiers" siren={company?.siren} />
      {companies && <FoldersTable
        companies={companies}
        handleOpenModal={handleOpenModal}
        handleSearch={setSearch}
        openProspectModal={(company) => { setSelectedCompany(company); openProspectModal(); }}
        openDeleteModal={(folderId) => { setSelectedFolder({ id: folderId } as FolderFormInputs); openDeleteModal(); }}
      />}
      <AddFolderModal
        isOpen={isFolderModalOpen}
        onRequestClose={closeFolderModal}
        onSubmit={handleCreateFolder}
        defaultValues={selectedFolder}
        role={user?.role}
        companyId={id as string}
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
