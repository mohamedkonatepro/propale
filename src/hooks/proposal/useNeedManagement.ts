import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Need, Item } from '@/types/models';
import React from 'react';
import NeedContent from '@/components/clientPortal/proposal/NeedContent';

export const useNeedManagement = (setLeftColumn: React.Dispatch<React.SetStateAction<Item[]>>, newNeedModalState: any) => {
  const [currentNeed, setCurrentNeed] = useState<Need | null>(null);

  const handleAddNeed = () => {
    setCurrentNeed(null);
    newNeedModalState.openModal();
  };

  const handleEditNeed = (need: Item) => {
    setCurrentNeed({
      id: need.id,
      name: need.name || '',
      quantity: need.quantity || 1,
      price: need.price || 1,
      description: need.description || '',
      showPrice: need.showPrice || false,
      showName: need.showName || false,
      showQuantity: need.showQuantity || false,
    });
    newNeedModalState.openModal();
  };

  const handleModalSubmitNeed = (data: Need) => {
    const needId = currentNeed?.id || uuidv4();
    const newNeed: Item = {
      id: needId,
      type: 'need' as const,
      name: data.name,
      quantity: data.quantity,
      price: data.price,
      description: data.description,
      showPrice: data.showPrice,
      showName: data.showName,
      showQuantity: data.showQuantity,
      content: React.createElement(NeedContent, { data, id: needId, onEdit: handleEditNeed }),

    };

    if (currentNeed) {
      setLeftColumn((prev) =>
        prev.map((item) => (item.id === currentNeed.id ? newNeed : item))
      );
    } else {
      setLeftColumn((prev) => [...prev, newNeed]);
    }

    newNeedModalState.closeModal(); // Close modal
    setCurrentNeed(null); // Reset current need state
  };

  return {
    handleAddNeed,
    handleEditNeed,
    handleModalSubmitNeed,
    currentNeed,
  };
};
