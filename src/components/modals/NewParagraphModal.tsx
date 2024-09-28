import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import { Switch } from '../common/Switch';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    padding: '2rem',
    borderRadius: '10px',
    maxHeight: '100vh',
    overflow: 'auto',
  },
};

type NewParagraphModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: {
    id: string;
    name: string;
    showName: boolean;
    description: string;
  } | null;
};

const NewParagraphModal: React.FC<NewParagraphModalProps> = ({ isOpen, onRequestClose, onSubmit, initialData }) => {
  // Pre-fill form fields if initialData is provided (for editing)
  const [name, setName] = useState(initialData?.name || '');
  const [showName, setShowName] = useState(initialData?.showName ?? true);
  const [description, setDescription] = useState(initialData?.description || '');

  // Reset form when the modal is opened/closed
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setShowName(initialData.showName);
      setDescription(initialData.description);
    } else {
      setName('');
      setShowName(true);
      setDescription('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, showName, description });
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      ariaHideApp={false}
    >
      <div className="flex justify-end mb-4">
        <button onClick={onRequestClose}>
          <FaTimes />
        </button>
      </div>
      <h2 className="text-2xl font-semibold text-center mb-2">
        {initialData ? 'Modifier paragraphe' : 'Nouveau paragraphe'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Titre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Titre du paragraphe"
            className="mt-1 block w-full p-2 rounded bg-gray-100"
          />
          <div className="flex items-center mt-2">
            <span className="mr-2">Afficher le titre</span>
            <Switch checked={showName} onCheckedChange={setShowName} />
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600">Texte</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Écrivez ici votre paragraphe"
            className="mt-1 block w-full p-2 rounded bg-gray-100"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blueCustom text-white py-2 px-6 rounded shadow hover:bg-blueCustom"
          >
            {initialData ? 'Modifier' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewParagraphModal;
