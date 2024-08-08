import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AddFolderModal from '@/components/modals/AddFolderModal';
import AddProspectModal from '@/components/modals/AddProspectModal';
import ListContactsModal from '@/components/modals/ListContactsModal';
import ProspectsTable from '@/components/DataTable/ProspectsTable';
import { Company, CompanyModalData, Profile } from '@/types/models';
import { toast } from 'react-toastify';
import useProspects from '@/hooks/useProspects';
import { fetchCompanyById, updateCompany } from '@/services/companyService';
import { fetchContactByCompanyId, createContact, updateContact, fetchProfilesWithUserDetails } from '@/services/profileService';
import { CSVLink } from 'react-csv';
import { GrFormEdit } from "react-icons/gr";
import useModalState from '@/hooks/useModalState';
import { deleteUserAuth } from '@/services/userService';
import ContactModal from '@/components/modals/ContactModal';

const ProspectList: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [contactsByProspect, setContactsByProspect] = useState<Profile[]>([]);
  const [search, setSearch] = useState<string>('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const csvLinkRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Company | undefined>(undefined);
  const [selectedContact, setSelectedContact] = useState<Profile | undefined>(undefined);
  const [isCsvLinkVisible, setIsCsvLinkVisible] = useState(false);

  const { prospects, fetchData, addProspect, editProspect, removeProspect } = useProspects(id as string, search);

  const prospectModalState = useModalState();
  const deleteModalState = useModalState();
  const folderModalState = useModalState();
  const contactsModalState = useModalState();
  const addContactModalState = useModalState();

  const getCompanyData = useCallback(async () => {
    if (!user?.id || !id) return;
    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);
    const companyContacts = await fetchContactByCompanyId(id as string);
    if (companyContacts) {
      setContacts(companyContacts);
    }
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
    fetchData();
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

  const getContacts = async (data?: Company) => {
    setContacts([]);
    if (data) {
      const companyContacts = await fetchProfilesWithUserDetails(data.id as string);
      setContactsByProspect(companyContacts ?? []);
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

  const handleDeleteContact = async (contactId: string) => {
    await deleteUserAuth(contactId);
    const updatedContacts = contactsByProspect.filter(contact => contact.id !== contactId);
    setContactsByProspect(updatedContacts);
    await getCompanyData();
    await fetchData();
    toast.success("Le contact a bien été supprimé !");
  };

  const handleSaveContact = async (data: Profile) => {
    if (selectedContact?.id) {
      await updateContact({ ...data, id: selectedContact.id });
    } else {
      await createContact(data);
    }
    contactsModalState.closeModal();
    getCompanyData();
  };

  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <div className="flex items-center mb-6">
          <div className='flex flex-col'>
            <div className='flex items-center'>
              <h2 className="text-3xl font-bold mb-2 mr-2">{company?.name}</h2>
              {company && <GrFormEdit onClick={folderModalState.openModal} className="text-2xl cursor-pointer text-stone-400" />}
            </div>
            <p className='text-black'>{company?.activity_sector}</p>
            <p className='text-stone-400'>{company?.description}</p>
          </div>
        </div>
      </div>
      <ProspectsTable
        prospects={prospects}
        handleSearch={setSearch}
        openProspectModal={(data) => { prospectModalState.openModal(); setSelectedProspect(data); }}
        openContactModal={(data) => { contactsModalState.openModal(); getContacts(data); }}
        openDeleteModal={(id: string) => { setSelectedProspect(prospects.find(p => p.id === id)); deleteModalState.openModal(); }}
        handleMultipleDelete={handleMultipleDelete}
        handleExportCsv={handleExportCsv}
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
        onSubmit={() => console.log('test')}
        onRequestBack={handleRequestBack}
        defaultValues={selectedContact}
      />
      <ListContactsModal
        isOpen={contactsModalState.isModalOpen}
        onClose={contactsModalState.closeModal}
        contacts={contactsByProspect}
        onAddContact={handleAddContact}
        onEditContact={handleEditContact}
        onDeleteContact={handleDeleteContact}
        onSaveContact={handleSaveContact}
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
