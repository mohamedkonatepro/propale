import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Company, CompanyModalData, Profile } from '@/types/models';
import { fetchCompanyById } from '@/services/companyService';
import { useUser } from '@/context/userContext';
import { heatLevels, statuses, Option } from '@/constants';
import ContactListContent from '@/components/clientPortal/ContactListContent';
import useContacts from '@/hooks/useContacts';
import useModalState from '@/hooks/useModalState';
import ContactModal from '@/components/modals/ContactModal';
import Badge from '@/components/common/Badge';
import { GrFormEdit } from 'react-icons/gr';
import { formatDate, getOption } from '@/lib/utils';
import AddProspectModal from '@/components/modals/AddProspectModal';
import useProspects from '@/hooks/useProspects';

const Audit: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [statusOption, setStatusOption] = useState<Option>();
  const [heatLevelOption, setHeatLevelOption] = useState<Option>();
  const contactsModalState = useModalState();
  const addContactModalState = useModalState();
  const prospectModalState = useModalState();

  const { editProspect } = useProspects();

  const {
    contacts,
    selectedContact,
    setSelectedContact,
    addOrUpdateContact,
    deleteContact,
    getContacts,
    fetchContacts,
  } = useContacts(id as string);
  
  const handleAddContact = () => {
    setSelectedContact(undefined);
    contactsModalState.closeModal();
    addContactModalState.openModal();
  };

  const saveContact = async (contact: Profile) => {
    if (company) {
      await addOrUpdateContact(contact, company);
      await getContacts(company);
      addContactModalState.closeModal();
      contactsModalState.openModal();
      await fetchContacts();
    }
  };

  const handleEditContact = (contactId: string) => {
    const contact = contacts.find(contact => contact.id === contactId);
    setSelectedContact(contact);
    contactsModalState.closeModal();
    addContactModalState.openModal();
  };

  const handleCreateProspect = async (data: CompanyModalData) => {
    if (company?.id) {
      await editProspect({ ...data, id: company.id } as Company);
    }
    prospectModalState.closeModal();
    loadData();
  };

  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {
      const company = await fetchCompanyById(id);
      setCompany(company);
      if (company?.status) {
        setStatusOption(getOption(company.status, statuses));
      }
      if (company?.heat_level) {
        setHeatLevelOption(getOption(company.heat_level, heatLevels));
      }
    } catch (err) {
      setError("Une erreur s'est produite lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="flex-grow p-12 overflow-y-auto pb-10">
      <div className="flex h-full justify-center">

        <div className='w-2/5 mr-8 flex flex-col'>
          <div className="bg-white p-8 rounded-2xl">
            <div className='flex items-center justify-between pb-6'>
              <h3 className='text-2xl font-semibold'>Informations générales</h3>
              <button 
                type="button" 
                className="text-base text-blueCustom flex items-center" 
                onClick={() => prospectModalState.openModal()}
              >
                <GrFormEdit className="text-blueCustom mr-2" size={20} />
                <span>Modifier</span>
              </button>
            </div>

            <div className="flex-grow space-y-6">
              <div>
                <label className="block text-base font-medium text-labelGray mb-1">Raison sociale</label>
                <p className="text-base font-medium text-black">{company?.name}</p>
              </div>

              <div>
                <label className="block text-base font-medium text-labelGray mb-1">SIREN</label>
                <p className="text-base font-medium text-black">{company?.siren}</p>
              </div>

              <div>
                <label className="block text-base font-medium text-labelGray mb-1">{"Secteur d'activité"}</label>
                <p className="text-base font-medium text-black">{company?.activity_sector}</p>
              </div>

              <div className='flex justify-between'>
                <div>
                  <label className="block text-base font-medium text-labelGray mb-1">Statut</label>
                  {statusOption && <Badge
                    label={statusOption.label}
                    color={statusOption.color}
                  />}
                </div>

                <div>
                  <label className="block text-base font-medium text-labelGray mb-1">Chaleur</label>
                  {heatLevelOption && <Badge
                    label={heatLevelOption.label}
                    color={heatLevelOption.color}
                    icon={heatLevelOption.icon ? <heatLevelOption.icon /> : null}
                  />}
                </div>
              </div>

              {company?.updated_at && (
                <div>
                  <label className="block text-base font-medium text-labelGray mb-1">Dernière modification</label>
                  <p className="text-base font-medium text-black">{formatDate(company?.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-2/5">
          <ContactListContent
            contacts={contacts}
            onAddContact={handleAddContact}
            onEditContact={handleEditContact}
            onDeleteContact={deleteContact}
            title='Contact'
          />
          <ContactModal 
            isOpen={addContactModalState.isModalOpen}
            onRequestClose={addContactModalState.closeModal}
            onSubmit={saveContact}
            defaultValues={selectedContact}
          />
          {company && (
            <AddProspectModal
              isOpen={prospectModalState.isModalOpen}
              onRequestClose={prospectModalState.closeModal}
              onSubmit={handleCreateProspect}
              companyId={company.company_id}
              defaultValues={company}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Audit;