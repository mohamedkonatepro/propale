import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AddFolderModal from '@/components/modals/AddFolderModal';
import AddProspectModal from '@/components/modals/AddProspectModal';
import ProspectsTable from '@/components/DataTable/ProspectsTable';
import { Company, CompanyModalData } from '@/types/models';
import { toast } from 'react-toastify';
import useProspects from '@/hooks/useProspects';
import { fetchCompanyById, updateCompany } from '@/services/companyService';
import { CSVLink } from 'react-csv';
import { GrFormEdit } from "react-icons/gr";

const ProspectList: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState<string>('');
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Company | null>(null);
  const [isModalOpenFolder, setIsModalOpenFolder] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isCsvLinkVisible, setIsCsvLinkVisible] = useState(false);
  const csvLinkRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);

  const { prospects, addProspect, removeProspect, fetchData } = useProspects(id as string, search);

  const getCompanyData = async () => {
    if (!user?.id || !id) return;

    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);
  };

  useEffect(() => {
    getCompanyData();
  }, [id, user]);

  const openProspectModal = () => {
    setIsProspectModalOpen(true);
  };

  const handleOpenModal = () => {
    setIsModalOpenFolder(true);
  };

  const closeProspectModal = () => {
    setIsProspectModalOpen(false);
  };

  const handleCloseModalFolder = () => {
    setIsModalOpenFolder(false);
  };

  const handleCreateProspect = async (data: CompanyModalData) => {
    await addProspect(data);
    closeProspectModal();
    fetchData();
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  };

  const handleCreateFolder = async (data: Company) => {
    if (company) {
      await updateCompany(data);
      toast.success(`${data.name} à bien été modifié.`);
    }
    await getCompanyData();
    handleCloseModalFolder();
  };

  const openDeleteModal = (prospectId: string) => {
    setSelectedProspect(prospects.find(p => p.id === prospectId) || null);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProspect(null);
  };

  const handleDeleteProspect = async () => {
    if (!selectedProspect) return;

    await removeProspect(selectedProspect.id);
    toast.success("Le prospect a bien été supprimé !");
    closeDeleteModal();
    fetchData();
  };

  const handleMultipleDelete = async (selectedRows: Company[]) => {
    if (selectedRows.length === 0) return;

    for (const prospect of selectedRows) {
      await removeProspect(prospect.id);
    }
    toast.success("Les prospects ont été supprimés !");
    fetchData();
  };

  const handleExportCsv = (selectedRows: Company[]) => {
    if (selectedRows.length === 0) return;

    const csvData = selectedRows.map(row => ({
      Name: row.name,
      Siren: row.siren,
      ActivitySector: row.activity_sector,
      Status: row.status,
      HeatLevel: row.heat_level,
    }));
    setCsvData(csvData);
    setIsCsvLinkVisible(true);
  };

  useEffect(() => {
    if (isCsvLinkVisible && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setIsCsvLinkVisible(false);
    }
  }, [isCsvLinkVisible, csvData]);

  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <div className="flex items-center mb-6">
          <div className='flex flex-col'>
            <div className='flex items-center'>
              <h2 className="text-3xl font-bold mb-2 mr-2 ">{company?.name}</h2>
              {company && <GrFormEdit
                onClick={() => handleOpenModal()}
                className="text-2xl cursor-pointer text-stone-400"
              />}
            </div>
            <p className='text-black'>{company?.activity_sector}</p>
            <p className='text-stone-400'>{company?.description}</p>
          </div>
        </div>
      </div>
      <ProspectsTable
        prospects={prospects}
        handleSearch={handleSearch}
        openProspectModal={openProspectModal}
        openDeleteModal={openDeleteModal}
        handleMultipleDelete={handleMultipleDelete}
        handleExportCsv={handleExportCsv}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteProspect}
        message="Êtes-vous sûr de vouloir supprimer ce prospect ?"
      />
      {company && user && (
        <AddFolderModal
          isOpen={isModalOpenFolder}
          onRequestClose={handleCloseModalFolder}
          onSubmit={handleCreateFolder}
          defaultValues={company}
          role={user?.role}
        />
      )}
      {company && (
        <AddProspectModal
          isOpen={isProspectModalOpen}
          onRequestClose={closeProspectModal}
          onSubmit={handleCreateProspect}
          company={company}
        />
      )}
      <CSVLink
        data={csvData}
        filename={"prospects.csv"}
        className="hidden"
        ref={csvLinkRef}
        target="_blank"
      >
        Télécharger CSV
      </CSVLink>
    </div>
  );
};

export default ProspectList;
