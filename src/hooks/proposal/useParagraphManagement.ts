import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Item } from '@/types/models';
import React from 'react';
import ParagraphContent from '@/components/clientPortal/proposal/ParagraphContent';

export const useParagraphManagement = (setLeftColumn: React.Dispatch<React.SetStateAction<Item[]>>, newParagraphModalState: any) => {
  const [currentParagraph, setCurrentParagraph] = useState<{ id: string; name: string; showName: boolean; description: string } | null>(null);

  const handleAddParagraph = () => {
    setCurrentParagraph(null);
    newParagraphModalState.openModal();
  };

  const handleEditParagraph = (paragraph: Item) => {
    setCurrentParagraph({
      id: paragraph.id,
      name: paragraph.name || '',
      showName: paragraph.showName || false,
      description: paragraph.description as string || '',
    });
    newParagraphModalState.openModal();
  };

  const handleModalSubmitParagraph = (data: { name: string; showName: boolean; description: string }) => {
    const paragraphId = currentParagraph?.id || uuidv4();
    const newParagraph: Item = {
      id: paragraphId,
      type: 'paragraph',
      name: data.name,
      showName: data.showName,
      description: data.description,
      content: React.createElement(ParagraphContent, { data, id: paragraphId, onEdit: handleEditParagraph }),

    };

    if (currentParagraph) {
      setLeftColumn((prev) =>
        prev.map((item) => (item.id === currentParagraph.id ? newParagraph : item))
      );
    } else {
      setLeftColumn((prev) => [...prev, newParagraph]);
    }

    newParagraphModalState.closeModal();
  };

  return {
    handleAddParagraph,
    handleEditParagraph,
    handleModalSubmitParagraph,
    currentParagraph,
  };
};
