import { useState, useEffect, useCallback } from 'react';
import { Company, Profile } from '@/types/models';
import { createContact, updateContact, fetchProfilesWithUserDetails } from '@/services/profileService';
import { toast } from 'react-toastify';
import { deleteUserAuth } from '@/services/userService';

const useContacts = (companyId: string) => {
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [selectedContact, setSelectedContact] = useState<Profile | undefined>(undefined);
  const [contactsByProspect, setContactsByProspect] = useState<Profile[]>([]);

  const fetchContacts = useCallback(async () => {
    const contactsData = await fetchProfilesWithUserDetails(companyId);
    setContacts(contactsData ?? []);
  }, [companyId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const getContacts = async (data?: Company) => {
    setContacts([]);
    if (data) {
      const companyContacts = await fetchProfilesWithUserDetails(data.id as string);
      setContactsByProspect(companyContacts ?? []);
    }
  };
  
  const addOrUpdateContact = async (contact: Profile, selectedCompanyId: string) => {
    if (contact.id) {
      await updateContact(contact, selectedCompanyId);
      toast.success('Le contact à bien été modifié')
    } else {
      await createContact(contact, selectedCompanyId);
      toast.success('Le contact à bien été ajouté')

    }
    fetchContacts();
  };

  const deleteContact = async (contactId: string) => {
    await deleteUserAuth(contactId);
    setContacts(contacts => contacts.filter(contact => contact.id !== contactId));
  };

  return {
    contacts,
    selectedContact,
    setSelectedContact,
    addOrUpdateContact,
    deleteContact,
    contactsByProspect,
    getContacts,
  };
};

export default useContacts;