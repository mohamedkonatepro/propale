import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Item } from '@/types/models';
import React from 'react';
import DescriptionContent from '@/components/clientPortal/proposal/DescriptionContent';

export const useDescriptionManagement = (
  setLeftColumn: React.Dispatch<React.SetStateAction<Item[]>>, 
  newDescriptionModalState: any
) => {
  const [currentDescription, setCurrentDescription] = useState<{ id: string; name: string; showName: boolean; description: string } | null>(null);

  const handleEditDescription = (description: Item) => {
    setCurrentDescription({
      id: description.id,
      name: description.name || '',
      showName: description.showName || false,
      description: description.description as string || '',
    });
    newDescriptionModalState.openModal();
  };

  const handleModalSubmitDescription = (data: { name: string; showName: boolean; description: string }) => {
    const newDescription: Item = {
      id: currentDescription?.id ? currentDescription.id : uuidv4(),
      type: 'description',
      name: data.name,
      showName: data.showName,
      description: data.description,
      content: React.createElement(DescriptionContent, {
        data,
        id: currentDescription?.id ? currentDescription.id : uuidv4(),
        onEdit: handleEditDescription,
      }),
    };

    if (currentDescription) {
      setLeftColumn((prev) => prev.map((item) => (item.id === currentDescription.id ? newDescription : item)));
    } else {
      setLeftColumn((prev) => [...prev, newDescription]);
    }

    newDescriptionModalState.closeModal();
    setCurrentDescription(null);
  };

  return {
    handleEditDescription,
    handleModalSubmitDescription,
    currentDescription,
  };
};
