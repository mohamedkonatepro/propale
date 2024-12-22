import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import { Switch } from '../common/Switch';
import { Need } from '@/types/models';

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

type NewNeedModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Need | null;
};

const NewNeedModal: React.FC<NewNeedModalProps> = ({ isOpen, onRequestClose, onSubmit, initialData }) => {
  // Pre-fill form fields if initialData is provided (for editing)
  const [name, setName] = useState(initialData?.name || '');
  const [showName, setShowName] = useState(initialData?.showName ?? true);
  const [showQuantity, setShowQuantity] = useState(initialData?.showQuantity ?? true);
  const [price, setPrice] = useState(initialData?.price || '');
  const [showPrice, setShowPrice] = useState(initialData?.showPrice ?? true);
  const [description, setDescription] = useState(initialData?.description || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || '1');

  // Reset form when the modal is opened/closed
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setShowName(initialData.showName);
      setPrice(initialData.price);
      setQuantity(initialData.quantity);
      setShowPrice(initialData.showPrice);
      setShowQuantity(initialData?.showQuantity);
      setDescription(initialData.description);
    } else {
      setName('');
      setShowName(true);
      setPrice('');
      setShowPrice(true);
      setShowQuantity(true);
      setDescription('');
      setQuantity('1');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, showName, price, showPrice, showQuantity, description, quantity});
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
        <button onClick={onRequestClose}><FaTimes /></button>
      </div>
      <h2 className="text-2xl font-medium text-center mb-2">
        {initialData ? 'Modifier besoin' : 'Nouveau besoin'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-labelGray">Titre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Titre du besoin"
            className="mt-1 block w-full p-2 rounded bg-backgroundGray"
          />
          <div className="flex items-center mt-2">
            <span className="mr-2">Afficher le titre</span>
            <Switch checked={showName} onCheckedChange={setShowName} />
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="block text-sm font-medium text-labelGray">Prix</label>
          <div className="flex items-center">
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Prix"
              className="mt-1 block w-full p-2 rounded bg-backgroundGray w-1/3"
            />
            <span className="ml-2 whitespace-nowrap">€ EUR</span>
          </div>
          <div className="flex items-center mt-2">
            <span className="mr-2">Afficher le prix</span>
            <Switch checked={showPrice} onCheckedChange={setShowPrice} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-labelGray">Quantité</label>
          <div className="flex items-center">
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="quantité"
              className="mt-1 block w-full p-2 rounded bg-backgroundGray w-1/3"
            />
          </div>
          <div className="flex items-center mt-2">
            <span className="mr-2">Afficher la quantité</span>
            <Switch checked={showQuantity} onCheckedChange={setShowQuantity} />
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-labelGray">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez ici votre besoin"
            className="mt-1 block w-full p-2 rounded bg-backgroundGray"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button type="submit" className="bg-blueCustom text-white py-2 px-6 rounded shadow">
            {initialData ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewNeedModal;
