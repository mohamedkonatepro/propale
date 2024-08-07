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

interface ListContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Profile[];
  onAddContact: () => void;
  onEditContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onSaveContact?: (contact: Profile) => void;
}

const ListContactsModal: React.FC<ListContactsModalProps> = ({ isOpen, onClose, contacts, onAddContact, onEditContact, onDeleteContact, onSaveContact }) => {
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.firstname.toLowerCase().includes(search.toLowerCase()) ||
    contact.lastname.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onClose} title="Contact">
      <div className="flex justify-end mb-4">
      <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md ml-4"
          onClick={onAddContact}
        >
          Nouveau contact
          <AiOutlineUserAdd className='ml-2'/>
        </button>
      </div>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Rechercher / Inviter un contact"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="max-h-96 overflow-y-auto bg-gray-200 p-2 rounded-lg">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="flex items-center justify-between p-3 border-b bg-white border rounded-lg mt-1">
            <div className='flex items-center'>
              {/* <Image src={contact.avatarUrl} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full" /> */}
              <div className="shadow-2xl w-10 h-10 rounded-full flex items-center justify-center bg-blue-200 text-blue-600 text-xs shadow-custom-left">
                {getInitials(contact.firstname, contact.lastname)}
              </div>
              <div>
              {contact.is_primary_contact && <div className="ml-4 w-fit px-2 py-1 text-xs bg-blue-100 text-black border border-blue-600 rounded-full">Contact principal</div>}

                <div className="ml-4 flex items-center ">
                  <p className="font-bold">{contact.firstname} {contact.lastname}</p>
                  <RxDividerVertical className="h-full" />
                  <p className="text-gray-500 text-sm">{contact.position}</p>
                </div>
                <div className="ml-4">
                  <div className='flex items-center text-blue-600'>
                    <FiPhone />
                    <div className='ml-1'>{contact.phone}</div>
                  </div>
                  <div className='flex items-center text-blue-600'>
                    <MdOutlineEmail />
                    <div className='ml-1'>{contact.email}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <FaPen className="text-blue-500 cursor-pointer mr-2" onClick={() => onEditContact(contact.id)} />
              <FaRegTrashAlt className="text-red-500 cursor-pointer ml-2" onClick={() => onDeleteContact(contact.id)} />
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

export default ListContactsModal;
