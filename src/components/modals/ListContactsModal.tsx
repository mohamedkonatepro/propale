import React, { useState } from 'react';
import Image from 'next/image';
import { FaRegTrashAlt, FaPen } from "react-icons/fa";
import BaseModal from './BaseModal';
import { Profile } from '@/types/models';
import { getInitials } from '@/lib/utils';
import { RxDividerVertical } from 'react-icons/rx';
import { MdOutlineEmail } from 'react-icons/md';
import { FiPhone } from 'react-icons/fi';
import { AiOutlineUserAdd } from "react-icons/ai";
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ListContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Profile[];
  onAddContact: () => void;
  onEditContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
}

const ListContactsModal: React.FC<ListContactsModalProps> = ({ isOpen, onClose, contacts, onAddContact, onEditContact, onDeleteContact }) => {
  const [search, setSearch] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Profile | null>(null);

  const filteredContacts = contacts.filter(contact =>
    contact.firstname.toLowerCase().includes(search.toLowerCase()) ||
    contact.lastname.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (contact: Profile) => {
    setContactToDelete(contact);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contactToDelete) {
      onDeleteContact(contactToDelete.id);
      setIsDeleteModalOpen(false);
      setContactToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setContactToDelete(null);
  };

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onClose} title="Contact">
      <div className="flex justify-end mb-4">
        <button
          className="flex items-center bg-blueCustom text-white px-4 py-2 rounded-md ml-4"
          onClick={onAddContact}
        >
          Nouveau contact
          <AiOutlineUserAdd className='ml-2'/>
        </button>
      </div>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Rechercher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="max-h-96 overflow-y-auto bg-gray-200 p-2 rounded-lg">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="flex items-center justify-between p-3 border-b bg-white border rounded-lg mt-1">
            <div className='flex items-center'>
              <div className="shadow-2xl w-10 h-10 rounded-full flex items-center justify-center bg-blue-200 text-blueCustom text-xs shadow-custom-left">
                {getInitials(contact.firstname, contact.lastname)}
              </div>
              <div>
                {contact.is_primary_contact && <div className="ml-4 w-fit px-2 py-1 text-xs bg-blue-100 text-black border border-blueCustom rounded-full">Contact principal</div>}
                <div className="ml-4 flex items-center ">
                  <p className="font-bold">{contact.firstname} {contact.lastname}</p>
                  <RxDividerVertical className="h-full" />
                  <p className="text-gray-500 text-sm">{contact.position}</p>
                </div>
                <div className="ml-4">
                  {contact.phone && <div className='flex items-center text-blueCustom'>
                    <FiPhone />
                    <div className='ml-1'>{contact.phone}</div>
                  </div>}
                  {contact.email && <div className='flex items-center text-blueCustom'>
                    <MdOutlineEmail />
                    <div className='ml-1'>{contact.email}</div>
                  </div>}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <FaPen className="text-blueCustom cursor-pointer mr-2" onClick={() => onEditContact(contact.id)} />
              <FaRegTrashAlt className="text-red-500 cursor-pointer ml-2" onClick={() => handleDeleteClick(contact)} />
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message={`Êtes-vous sûr de vouloir supprimer ${contactToDelete?.firstname} ${contactToDelete?.lastname} ?`}
      />
    </BaseModal>
  );
};

export default ListContactsModal;
