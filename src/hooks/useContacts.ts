import { useState, useEffect, useCallback } from 'react';
import { Company, Profile } from '@/types/models';
import { createContact, updateContact, fetchProfilesWithUserDetails, countProfilesByCompanyId } from '@/services/profileService';
import { toast } from 'react-toastify';
import { deleteUserAuth } from '@/services/userService';
import { fetchCompanyById, findTopMostParentCompany } from '@/services/companyService';
import { fetchCompanySettings } from '@/services/companySettingsService';

const useContacts = (companyId: string) => {
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [company, setCompany] = useState<Company | null>(null);

  const [selectedContact, setSelectedContact] = useState<Profile | undefined>(undefined);
  const [contactsByProspect, setContactsByProspect] = useState<Profile[]>([]);

  const fetchContacts = useCallback(async () => {
    const contactsData = await fetchProfilesWithUserDetails(companyId);
    const companyData = await fetchCompanyById(companyId);
    setContacts(contactsData ?? []);
    setCompany(companyData);
  }, [companyId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const getContacts = async (data?: Company) => {
    if (data) {
      const companyContacts = await fetchProfilesWithUserDetails(data.id as string);
      setContactsByProspect(companyContacts ?? []);
    }
  };
  
  const addOrUpdateContact = async (contact: Profile, selectedCompany: Company) => {
    try {
      if (contact.id) {
        await updateContact(contact, selectedCompany.id);
        toast.success('The contact has been successfully updated');
      } else {
        const currentContactCount = await countProfilesByCompanyId(selectedCompany.id);
        const companyParent = await findTopMostParentCompany(selectedCompany)
        if (companyParent?.id) {
          const settings = await fetchCompanySettings(companyParent.id);
          
          if (!settings) {
            throw new Error("Unable to retrieve parent company settings");
          }
          
          if (currentContactCount >= settings.contacts_per_prospect) {
            throw new Error("Maximum number of contacts per prospect has been reached");
          }
        }
        
        await createContact(contact, selectedCompany.id);
        toast.success('The contact has been successfully added');
      }
      
      await fetchContacts();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue lors de la gestion du contact");
      }
    }
  };

  const deleteContact = async (contactId: string) => {
    await deleteUserAuth(contactId);
    setContactsByProspect(contactsByProspect => contactsByProspect.filter(contact => contact.id !== contactId));
  };

  return {
    contacts,
    selectedContact,
    setSelectedContact,
    addOrUpdateContact,
    deleteContact,
    contactsByProspect,
    getContacts,
    fetchContacts,
  };
};

export default useContacts;
