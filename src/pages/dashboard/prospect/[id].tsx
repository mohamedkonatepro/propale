import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AddFolderModal from '@/components/modals/AddFolderModal';
import AddProspectModal from '@/components/modals/AddProspectModal';
import ListContactsModal from '@/components/modals/ListContactsModal';
import ContactModal from '@/components/modals/ContactModal';
import ProspectsTable, { ProspectsTableRef } from '@/components/DataTable/ProspectsTable';
import { Company, CompanyModalData, Profile } from '@/types/models';
import { toast } from 'react-toastify';
import useProspects from '@/hooks/useProspects';
import { fetchCompanyById, updateCompany } from '@/services/companyService';
import useModalState from '@/hooks/useModalState';
import useContacts from '@/hooks/useContacts';
import { CSVLink } from 'react-csv';
import { GrFormEdit } from "react-icons/gr";
import ProfileAvatarGroup from '@/components/common/ProfileAvatarGroup';
import ShareFolderModal from '@/components/modals/ShareFolderModal';
import useProfileManagement from '@/hooks/useProfileManagement';

const ProspectList: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState<string>('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const csvLinkRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Company | undefined>(undefined);
  const [selectedProspects, setSelectedProspects] = useState<Company[] | undefined>(undefined);
  const [isCsvLinkVisible, setIsCsvLinkVisible] = useState(false);
  const tableRef = useRef<ProspectsTableRef>(null);

  const { prospects, fetchData, addProspect, editProspect, removeProspect } = useProspects(id as string, search);
  const {
    contacts,
    selectedContact,
    setSelectedContact,
    addOrUpdateContact,
    deleteContact,
    contactsByProspect,
    getContacts,
    fetchContacts,
  } = useContacts(id as string);

  const { 
    availableUsers,
    folderUsers,
    deleteAssociateProfileAndCompany,
    associateProfileAndCompany
  } = useProfileManagement(id as string);

  const prospectModalState = useModalState();
  const deleteModalState = useModalState();
  const deleteMultipleModalState = useModalState();
  const folderModalState = useModalState();
  const contactsModalState = useModalState();
  const addContactModalState = useModalState();
  const shareFolderModalState = useModalState();

  const getCompanyData = useCallback(async () => {
    if (!user?.id || !id) return;
    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);
  }, [user, id]);

  useEffect(() => {
    getCompanyData();
    setIsMounted(true);
  }, [getCompanyData]);

  const handleCreateProspect = async (data: CompanyModalData) => {
    if (selectedProspect?.id) {
      await editProspect({ ...data, id: selectedProspect.id } as Company);
    } else {
      await addProspect(data);
    }
    prospectModalState.closeModal();
    await fetchData();
  };

  const handleCreateFolder = async (data: Company) => {
    if (company) {
      await updateCompany(data);
      toast.success(`${data.name} à bien été modifié.`);
      await getCompanyData();
    }
    folderModalState.closeModal();
  };

  const handleDeleteProspect = async () => {
    if (!selectedProspect) return;
    await removeProspect(selectedProspect.id);
    toast.success("Le prospect a bien été supprimé !");
    deleteModalState.closeModal();
    await fetchData();
  };

  const handleMultipleDelete = async (selectedRows: Company[]) => {
    if (selectedRows.length === 0) return;
    for (const prospect of selectedRows) {
      await removeProspect(prospect.id);
    }
    toast.success("Les prospects ont été supprimés !");
    await fetchData();
  };

  const executeMultipleDelete = async () => {
    if (selectedProspects) {
      if (tableRef.current) {
        tableRef.current.toggleAllRowsSelected(false);
      }
      await handleMultipleDelete(selectedProspects);
      deleteMultipleModalState.closeModal();
      
      setSelectedProspects(undefined);
    }
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
 
  const saveContact = async (contact: Profile) => {
    if (selectedProspect) {
      await addOrUpdateContact(contact, selectedProspect);
      await getContacts(selectedProspect);
      addContactModalState.closeModal();
      contactsModalState.openModal();
      await fetchData();
    }
  };

  const handleAddContact = () => {
    setSelectedContact(undefined);
    contactsModalState.closeModal();
    addContactModalState.openModal();
  };

  const handleRequestBack = () => {
    setSelectedContact(undefined);
    contactsModalState.openModal();
    addContactModalState.closeModal();
  };

  const handleEditContact = (contactId: string) => {
    const contact = contactsByProspect.find(contact => contact.id === contactId);
    setSelectedContact(contact);
    contactsModalState.closeModal();
    addContactModalState.openModal();
  };
  
  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <div className="flex justify-between items-center mb-6">
          <div className='flex flex-col'>
            <div className='flex items-center'>
              <h2 className="text-3xl font-bold mb-2 mr-2">{company?.name}</h2>
              {company && <GrFormEdit onClick={folderModalState.openModal} className="text-2xl cursor-pointer text-stone-400" />}
            </div>
            <p className='text-black'>{company?.activity_sector}</p>
            <p className='text-stone-400'>{company?.description}</p>
          </div>

          <div>
            <ProfileAvatarGroup profiles={contacts} maxDisplay={3} onButtonClick={() => shareFolderModalState.openModal()} text="Partager" />
          </div>
        </div>
      </div>
      <ProspectsTable
        ref={tableRef}
        prospects={prospects}
        handleSearch={setSearch}
        openProspectModal={(data) => { prospectModalState.openModal(); setSelectedProspect(data); }}
        openContactModal={(data) => { contactsModalState.openModal(); getContacts(data); setSelectedProspect(data); }}
        openDeleteModal={(id: string) => { setSelectedProspect(prospects.find(p => p.id === id)); deleteModalState.openModal(); }}
        handleMultipleDelete={(selectedRows: Company[]) => {setSelectedProspects(selectedRows); deleteMultipleModalState.openModal(); }}
        handleExportCsv={handleExportCsv}
      />
      <ConfirmDeleteModal
        isOpen={deleteMultipleModalState.isModalOpen}
        onClose={deleteMultipleModalState.closeModal}
        onConfirm={executeMultipleDelete}
        message="Êtes-vous sûr de vouloir supprimer les prospects ?"
      />
      <ConfirmDeleteModal
        isOpen={deleteModalState.isModalOpen}
        onClose={deleteModalState.closeModal}
        onConfirm={handleDeleteProspect}
        message="Êtes-vous sûr de vouloir supprimer ce prospect ?"
      />
      {company && user && (
        <AddFolderModal
          isOpen={folderModalState.isModalOpen}
          onRequestClose={folderModalState.closeModal}
          onSubmit={handleCreateFolder}
          defaultValues={company}
          role={user?.role}
          companyId={id as string}
        />
      )}
      {company && (
        <AddProspectModal
          isOpen={prospectModalState.isModalOpen}
          onRequestClose={prospectModalState.closeModal}
          onSubmit={handleCreateProspect}
          company={company}
          defaultValues={selectedProspect}
        />
      )}
      <ContactModal 
        isOpen={addContactModalState.isModalOpen}
        onRequestClose={addContactModalState.closeModal}
        onSubmit={saveContact}
        onRequestBack={handleRequestBack}
        defaultValues={selectedContact}
      />
      <ListContactsModal
        isOpen={contactsModalState.isModalOpen}
        onClose={contactsModalState.closeModal}
        contacts={contactsByProspect}
        onAddContact={handleAddContact}
        onEditContact={handleEditContact}
        onDeleteContact={deleteContact}
      />
      <ShareFolderModal
        isOpen={shareFolderModalState.isModalOpen}
        onClose={() => { shareFolderModalState.closeModal(); fetchContacts(); }}
        availableUsers={availableUsers}
        folderUsers={folderUsers}
        onAddUser={associateProfileAndCompany}
        onRemoveUser={deleteAssociateProfileAndCompany}
      />
      {isMounted && (
        <CSVLink
          data={csvData}
          filename={"prospects.csv"}
          className="hidden"
          ref={csvLinkRef}
          target="_blank"
        >
          Télécharger CSV
        </CSVLink>
      )}
    </div>
  );
};

export default ProspectList;
