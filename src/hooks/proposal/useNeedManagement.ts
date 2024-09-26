import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NeedFormData, Item } from '@/types/models';
import React from 'react';
import NeedContent from '@/components/clientPortal/proposal/NeedContent';

export const useNeedManagement = (setLeftColumn: React.Dispatch<React.SetStateAction<Item[]>>, newNeedModalState: any) => {
  const [currentNeed, setCurrentNeed] = useState<NeedFormData | null>(null);

  const handleAddNeed = () => {
    setCurrentNeed(null);
    newNeedModalState.openModal();
  };

  const handleEditNeed = (need: Item) => {
    setCurrentNeed({
      id: need.id,
      name: need.name || '',
      quantity: need.quantity?.toString() || '',
      price: need.price?.toString() || '',
      description: need.description || '',
      showPrice: need.showPrice || false,
      showName: need.showName || false,
    });
    newNeedModalState.openModal();
  };

  const handleModalSubmitNeed = (data: NeedFormData) => {
    const needId = currentNeed?.id || uuidv4();
    const newNeed: Item = {
      id: needId,
      type: 'need' as const,
      name: data.name,
      quantity: data.quantity ? parseFloat(data.quantity) : 1,
      price: parseFloat(data.price),
      description: data.description,
      showPrice: data.showPrice,
      showName: data.showName,
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
