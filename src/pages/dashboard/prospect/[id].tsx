import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AddFolderModal from '@/components/modals/AddFolderModal';
import AddProspectModal from '@/components/modals/AddProspectModal';
import ListContactsModal from '@/components/modals/ListContactsModal';
import ContactModal from '@/components/modals/ContactModal';
import ProspectsTable, { ProspectsTableRef } from '@/components/DataTable/ProspectsTable';
import { Company, Profile } from '@/types/models';
import { toast } from 'react-toastify';
import useProspects from '@/hooks/useProspects';
import { fetchCompanyById, fetchTopMostParentCompanyCompanyById, updateCompany } from '@/services/companyService';
import useModalState from '@/hooks/useModalState';
import useContacts from '@/hooks/useContacts';
import { CSVLink } from 'react-csv';
import { GrFormEdit } from "react-icons/gr";
import ProfileAvatarGroup from '@/components/common/ProfileAvatarGroup';
import ShareFolderModal from '@/components/modals/ShareFolderModal';
import useProfileManagement from '@/hooks/useProfileManagement';
import { DbCompanySettings } from '@/types/dbTypes';
import { fetchCompanySettings } from '@/services/companySettingsService';
import MailGroupModal, { MailGroupFormInputs } from '@/components/modals/MailGroupModal';
import { fetchContactByCompanyId, fetchPrimaryContactByCompanyId } from '@/services/profileService';
import { sendEmailByContacts } from '@/services/emailService';
import { CompanyFormInputs } from '@/schemas/company';
import { FolderFormInputs } from '@/schemas/folder';
import { formatAmount, formatDate, getOption } from '@/lib/utils';
import { heatLevels, proposalStatusOptions, statuses } from '@/constants';
import { getStepperSession } from '@/services/stepperService';
import { getProposalsByProspectId } from '@/services/proposalService';

const ProspectList: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyForSettings, setCompanyForSettings] = useState<Company | null>(null);

  const [search, setSearch] = useState<string>('');
  const [csvData, setCsvData] = useState<any[]>([]);
  const csvLinkRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Company | undefined>(undefined);
  const [selectedProspects, setSelectedProspects] = useState<Company[] | undefined>(undefined);
  const [isCsvLinkVisible, setIsCsvLinkVisible] = useState(false);
  const tableRef = useRef<ProspectsTableRef>(null);
  const [settings, setSettings] = useState<DbCompanySettings | null>(null);

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
  const emailMultipleModalState = useModalState();
  const folderModalState = useModalState();
  const contactsModalState = useModalState();
  const addContactModalState = useModalState();
  const shareFolderModalState = useModalState();

  const getCompanyData = useCallback(async () => {
    if (!user?.id || !id) return;
    setLoading(true);
    try {
      const companyData = await fetchCompanyById(id as string);
      const companyForSettings = await fetchTopMostParentCompanyCompanyById(id as string);
      if (companyForSettings) {
        const settings = await fetchCompanySettings(companyForSettings.id);
        setSettings(settings);
        setCompanyForSettings(companyForSettings);
      }
      setCompany(companyData);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    getCompanyData();
    setIsMounted(true);
  }, [getCompanyData]);

  const handleCreateProspect = async (data: CompanyFormInputs) => {
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
      console.log('selectedProspects ::: ', selectedProspects)
      await handleMultipleDelete(selectedProspects);
      deleteMultipleModalState.closeModal();
      
      setSelectedProspects(undefined);
    }
  };

  const handleExportCsv = async (selectedRows: Company[]) => {
    if (selectedRows.length === 0) return;
  
    const csvData = await Promise.all(selectedRows.map(async (row) => {
      const statusOption = getOption(row.status, statuses);
      const heatLevelOption = getOption(row.heat_level, heatLevels);
      const fetchedProfile = await fetchPrimaryContactByCompanyId(row.id);
      const contact = await fetchContactByCompanyId(row.id);
      if (!companyForSettings || !user) {
        return {};
      }
      const session = await getStepperSession(companyForSettings.id, row.id);
      const statusWorkflow = session?.session.status === 'in_progress' || session?.session.status === 'saved' 
        ? "En cours" 
        : session?.session.status === 'completed' 
        ? "Terminé" 
        : "";
  
      const { proposals } = await getProposalsByProspectId(row.id, user);
      const proposal = proposals[0];
      const option = proposalStatusOptions.find(option => option.value === proposal?.status);
  
      const totalAmount = proposal?.total_price !== undefined && proposal?.total_price !== null 
        ? formatAmount(proposal.total_price) 
        : "";
  
      return {
        'entreprise': companyForSettings.name,
        'siren entreprise': companyForSettings.siren,
        'Dossier': company?.name,
        'siret dossier': company?.siret,
        'raison sociale prospect': row.name,
        'siren prospect': row.siren,
        'statut prospect': statusOption.label,
        'chaleur prospect': heatLevelOption.label,
        'prénom contact principal': fetchedProfile?.firstname,
        'nom contact principal': fetchedProfile?.lastname,
        'fonction contact principal': fetchedProfile?.position,
        'email contact principal': fetchedProfile?.email,
        'téléphone contact principal': fetchedProfile?.phone,
        'prénom contact 2': contact?.[0]?.firstname,
        'nom contact 2': contact?.[0]?.lastname,
        'fonction contact 2': contact?.[0]?.position,
        'email contact 2': contact?.[0]?.email,
        'téléphone contact 2': contact?.[0]?.phone,
        'prénom contact 3': contact?.[1]?.firstname,
        'nom contact 3': contact?.[1]?.lastname,
        'fonction contact 3': contact?.[1]?.position,
        'email contact 3': contact?.[1]?.email,
        'téléphone contact 3': contact?.[1]?.phone,
        'prénom contact 4': contact?.[2]?.firstname,
        'nom contact 4': contact?.[2]?.lastname,
        'fonction contact 4': contact?.[2]?.position,
        'email contact 4': contact?.[2]?.email,
        'téléphone contact 4': contact?.[2]?.phone,
        'prénom contact 5': contact?.[3]?.firstname,
        'nom contact 5': contact?.[3]?.lastname,
        'fonction contact 5': contact?.[3]?.position,
        'email contact 5': contact?.[3]?.email,
        'téléphone contact 5': contact?.[3]?.phone,
        'workflow': statusWorkflow,
        'proposition commerciale': proposal?.name ? "Oui" : "Non",
        'nom de la proposition commerciale': proposal?.name,
        'montant total (HT)': totalAmount,
        'date de création de la proposition commerciale': proposal?.created_at ? formatDate(new Date(proposal?.created_at)) : '',
        'date de modification de la proposition commerciale': proposal?.updated_at ? formatDate(new Date(proposal?.updated_at)) : '',
        'statut de la proposition commerciale': option?.label,
      };
    }));
  
    setCsvData(csvData);
    setIsCsvLinkVisible(true);
  };
  
  
  

  const handleSendEmail = async (selectedRows: Company[]) => {
    if (selectedRows.length === 0) return;
    setSelectedProspects(selectedRows);
    emailMultipleModalState.openModal()
  };

  const handleSendEmailToProspect = async (data: MailGroupFormInputs) => {
    try {
      if (!selectedProspects || selectedProspects.length === 0 || !user) {
        console.error('No prospects selected');
        return;
      }
      const allProfiles: Profile[] = [];
  
      for (const prospect of selectedProspects) {
        const profiles = await fetchContactByCompanyId(prospect.id, true);
  
        if (profiles) {
          allProfiles.push(...profiles);
        }
      }
      await sendEmailByContacts(allProfiles, data.message, data.subject, true, user);
      toast.success('Email envoyé avec succès')
    } catch (error) {
      console.error('Error fetching profiles or sending emails:', error);
      toast.error("Erreur lors de l'envoi des emails")

    }
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
      {loading || !prospects || !company || !settings ? <div>Chargement...</div> : <ProspectsTable
        ref={tableRef}
        prospects={prospects}
        handleSearch={setSearch}
        openProspectModal={(data) => { prospectModalState.openModal(); setSelectedProspect(data); }}
        openContactModal={(data) => { contactsModalState.openModal(); getContacts(data); setSelectedProspect(data); }}
        openDeleteModal={(id: string) => { setSelectedProspect(prospects.find(p => p.id === id)); deleteModalState.openModal(); }}
        handleMultipleDelete={(selectedRows: Company[]) => {setSelectedProspects(selectedRows); deleteMultipleModalState.openModal(); }}
        handleExportCsv={handleExportCsv}
        handleSendEmail={handleSendEmail}
        settings={settings}
        user={user}
      />}
      <MailGroupModal
        isOpen={emailMultipleModalState.isModalOpen}
        onRequestClose={emailMultipleModalState.closeModal}
        onSubmit={handleSendEmailToProspect}
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
          defaultValues={company as FolderFormInputs}
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
      {user && <ListContactsModal
        isOpen={contactsModalState.isModalOpen}
        onClose={contactsModalState.closeModal}
        contacts={contactsByProspect}
        onAddContact={handleAddContact}
        onEditContact={handleEditContact}
        onDeleteContact={deleteContact}
        user={user}
      />}
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
          separator={";"}
        >
          Télécharger CSV
        </CSVLink>
      )}
    </div>
  );
};

export default ProspectList;
