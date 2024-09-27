import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Need, Paragraph, Item, ProposalStatus } from '@/types/models';
import { getProposalById } from '@/services/proposalService';
import NeedContent from '@/components/clientPortal/proposal/NeedContent';
import ParagraphContent from '@/components/clientPortal/proposal/ParagraphContent';
import { enforceRightColumnConstraints } from '@/hooks/proposal/useDragAndDrop';
import { getStepperSession } from '@/services/stepperService';

export const loadProposalData = async (
  proposalId: string | undefined,
  company: any,
  prospect: any,
  setLeftColumn: (updateFn: (prev: Item[]) => Item[]) => void,
  setRightColumn: (updateFn: (prev: Item[]) => Item[]) => void,
  handleEditDescription: (description: any) => void,
  handleEditNeed: (need: any) => void,
  handleEditParagraph: (paragraph: any) => void,
  setProposalStatus: (status: ProposalStatus['status']) => void,
  setNameProposal: (name: string) => void,
) => {
  if (proposalId) {
    const { proposal, needs, paragraphs } = await getProposalById(proposalId);
    setProposalStatus(proposal.status);
    setNameProposal(proposal.name);
    if (proposal.title && proposal.description || proposal.description === 'Ceci est la description initiale du projet.' && proposal.title === 'Description du projet') {
      setLeftColumn([] as any);
      setRightColumn((prev) => [
        { id: 'header', type: 'header', content: 'En-tête' },
        {
          id: proposal.id,
          type: 'description',
          name: proposal.title,
          description: proposal.description,
          showName: proposal.show_title,
          content: React.createElement(
            'div',
            { className: 'relative' },
            React.createElement('div', { className: 'font-bold' }, proposal.title),
            React.createElement('div', null, proposal.description),
            React.createElement(
              'button',
              {
                onClick: () =>
                  handleEditDescription({
                    id: proposal.id,
                    type: 'description',
                    name: proposal.title,
                    showName: proposal.show_title,
                    description: proposal.description,
                    content: '',
                  }),
                className: 'absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700',
              },
              React.createElement('i', { className: 'text-xl' })
            )
          ),
        },
        { id: 'price', type: 'price', content: 'Prix' },
      ]);
    }

    if (needs.length > 0) {
      setRightColumn((prev) => {
        const updatedRightColumn = [
          ...prev,
          ...needs.map((need: Need) => ({
            id: need.id || uuidv4(),
            type: 'need' as const,
            name: need.name,
            quantity: need.quantity,
            price: need.price,
            description: need.description,
            showName: need.showName,
            showPrice: need.showPrice,
            content: React.createElement(NeedContent, { data: need, id: need.id || uuidv4(), onEdit: handleEditNeed }),
          })),
        ];
        return enforceRightColumnConstraints(updatedRightColumn);
      });
    }

    if (paragraphs.length > 0) {
      setRightColumn((prev) => {
        const updatedRightColumn = [
          ...prev,
          ...paragraphs.map((paragraph: Paragraph) => ({
            id: paragraph.id || uuidv4(),
            type: 'paragraph' as const,
            name: paragraph.name,
            description: paragraph.description,
            showName: paragraph.showName,
            content: React.createElement(ParagraphContent, { data: paragraph, id: paragraph.id || uuidv4(), onEdit: handleEditParagraph }),
          })),
        ];
        return enforceRightColumnConstraints(updatedRightColumn);
      });
    }
  } else if (company && prospect) {
    const savedSession = await getStepperSession(company.id, prospect.id);
    const combinedNeeds = savedSession?.responses
      ?.filter(response => response.product_id)
      ?.reduce((acc, response) => {
        const existingNeed = acc.find(need => need.id === response.product_id);
        if (existingNeed && existingNeed.quantity) {
          existingNeed.quantity += response.product_quantity;
        } else {
          acc.push({
            id: response.product_id || '',
            name: response.product_name,
            price: response.product_price,
            quantity: response.product_quantity,
            description: response.product_description,
            type: 'need',
            showPrice: true,
            showName: true,
            content: '',
          });
        }
        return acc;
      }, [] as Array<Item>) ?? [];

    const newNeeds = combinedNeeds.map(need => ({
      id: need.id || '',
      type: 'need' as const,
      name: need.name,
      quantity: need.quantity,
      price: need.price,
      description: need.description,
      showPrice: true,
      showTitle: true,
      content: React.createElement(NeedContent, { data: need as Need, id: need.id || '', onEdit: handleEditNeed }),
    }));

    setLeftColumn((prev) => [
      ...prev.filter((item: Item) => item.type !== 'need'),
      ...newNeeds,
    ]);
  }
};
