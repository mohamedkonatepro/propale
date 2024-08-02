import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Company, Profile } from '@/types/models';
import Image from 'next/image';
import Modal from 'react-modal';
import { PiLineVerticalThin } from "react-icons/pi";
import { Switch } from '../common/Switch';

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
  initialFolders: Company[];
  userAccess: Set<string>;
  onSave: (updatedAccess: Set<string>, selectedUserId: string) => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    padding: '2rem',
    borderRadius: '10px',
    maxHeight: '100vh',
    overflow: 'auto',
  },
};

const ManageAccessModal: React.FC<ManageAccessModalProps> = ({ isOpen, onClose, user, initialFolders, userAccess, onSave }) => {
  const [search, setSearch] = useState('');
  const [access, setAccess] = useState(new Set<string>(userAccess));

  useEffect(() => {
    setAccess(new Set<string>(userAccess));
  }, [userAccess]);

  const handleToggleAccess = (companyId: string) => {
    const newAccess = new Set(access);
    if (newAccess.has(companyId)) {
      newAccess.delete(companyId);
    } else {
      newAccess.add(companyId);
    }
    setAccess(newAccess);
  };

  const handleSave = () => {
    onSave(access, user.id);
    onClose();
  };

  const filteredFolders = initialFolders.filter(folder =>
    folder.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      ariaHideApp={false}
    >
      <div className="flex justify-end">
        <button onClick={onClose} className="text-gray-500">
          <FaTimes size={20} />
        </button>
      </div>
      <h2 className="text-2xl font-semibold text-center mb-4">Gérer l’accès aux dossiers</h2>
      <div className="flex flex-col items-center mb-4">
        <Image src="/avatar.svg" alt="avatar" width={96} height={96} className="w-24 h-24 rounded-full mb-4" />
        <h2 className="text-xl font-semibold">{user.firstname} {user.lastname}</h2>
        <p className="text-gray-500">{user.position}</p>
      </div>
      <p className="text-center text-sm mb-4">Sélectionnez les dossiers à partager avec cet utilisateur</p>
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
          {filteredFolders.map((folder) => (
            <div key={folder.id} className="flex items-center justify-between p-3 border-b bg-white border rounded-lg mt-1">
              <div className='flex items-center'>
                <p className="font-bold">{folder.name}</p>
                <PiLineVerticalThin />
                <p className="text-gray-500 text-sm">SIRET {folder.siret}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="access"
                  checked={access.has(folder.id)}
                  onCheckedChange={() => handleToggleAccess(folder.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={handleSave}
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
};

export default ManageAccessModal;
