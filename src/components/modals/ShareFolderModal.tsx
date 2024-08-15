import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { FaTimes } from "react-icons/fa";
import { Profile } from '@/types/models';
import { PiLineVerticalThin } from 'react-icons/pi';
import { getInitials } from '@/lib/utils';
import { RxDividerVertical } from 'react-icons/rx';
import { FiPhone } from 'react-icons/fi';
import { MdOutlineEmail } from 'react-icons/md';

interface ShareFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: Profile[];
  folderUsers: Profile[];
  onAddUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
}

const ShareFolderModal: React.FC<ShareFolderModalProps> = ({ isOpen, onClose, availableUsers, folderUsers, onAddUser, onRemoveUser }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = availableUsers.filter(user =>
    user.firstname.toLowerCase().includes(search.toLowerCase()) ||
    user.lastname.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onClose} title="Partage du dossier">

      <div className='mb-3 mt-5'>
        <h3 className="text-lg font-medium">Ajouter un utilisateur</h3>
      </div>
      <div>
        <div className='bg-gray-100 p-5 rounded-lg'>
          <div className="">
            <input
              type="text"
              placeholder="Recherche"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="max-h-64 overflow-y-auto bg-gray-200 p-2 rounded-b-lg">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border-b bg-white border rounded-lg mt-1">
                <div className='flex items-center'>
                <div className="shadow-2xl w-10 h-10 rounded-full flex items-center justify-center bg-blue-200 text-blue-600 text-xs shadow-custom-left mr-3">
                  {getInitials(user.firstname, user.lastname)}
                </div>
                  <p className="font-bold">{user.firstname} {user.lastname}</p>
                  <PiLineVerticalThin />
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-blue-600"
                    onClick={() => onAddUser(user.id)}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Utilisateurs du dossier</h3>
          <div className="max-h-96 overflow-y-auto bg-gray-200 p-2 rounded-lg">
            {folderUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border-b bg-white border rounded-lg mt-1">
                <div className='flex items-center'>
                  {/* <Image src={user.avatarUrl} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full" /> */}
                  <div className="shadow-2xl w-10 h-10 rounded-full flex items-center justify-center bg-blue-200 text-blue-600 text-xs shadow-custom-left">
                    {getInitials(user.firstname, user.lastname)}
                  </div>
                  <div>
                  {user.is_primary_contact && <div className="ml-4 w-fit px-2 py-1 text-xs bg-blue-100 text-black border border-blue-600 rounded-full">Contact principal</div>}

                    <div className="ml-4 flex items-center ">
                      <p className="font-bold">{user.firstname} {user.lastname}</p>
                      <RxDividerVertical className="h-full" />
                      <p className="text-gray-500 text-sm">{user.position}</p>
                    </div>
                    <div className="ml-4">
                      {user.phone && <div className='flex items-center text-blue-600'>
                        <FiPhone />
                        <div className='ml-1'>{user.phone}</div>
                      </div>}
                      {user.email && <div className='flex items-center text-blue-600'>
                        <MdOutlineEmail />
                        <div className='ml-1'>{user.email}</div>
                      </div>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    className="text-red-600"
                    onClick={() => onRemoveUser(user.id)}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ShareFolderModal;
