import React from 'react';
import BaseModal from './BaseModal';
import { Profile } from '@/types/models';
import ContactListContent from '../clientPortal/ContactListContent';

interface ListContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Profile[];
  onAddContact: () => void;
  onEditContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  user: Profile;
}

const ListContactsModal: React.FC<ListContactsModalProps> = ({ 
  isOpen, 
  onClose, 
  contacts, 
  onAddContact, 
  onEditContact, 
  onDeleteContact,
  user
}) => {
  return (
    <BaseModal isOpen={isOpen} onRequestClose={onClose} title="Contact">
      <ContactListContent
        contacts={contacts}
        onAddContact={onAddContact}
        onEditContact={onEditContact}
        onDeleteContact={onDeleteContact}
        user={user}
      />
    </BaseModal>
  );
};

export default ListContactsModal;