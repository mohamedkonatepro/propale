import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Company, Item, Need, Paragraph, ProposalData, ProposalStatus } from '@/types/models';
import { fetchCompanyById, fetchTopMostParentCompanyCompanyById } from '@/services/companyService';
import { useUser } from '@/context/userContext';
import useModalState from '@/hooks/useModalState';
import { DragDropContext } from 'react-beautiful-dnd';
import { GrFormEdit } from 'react-icons/gr';
import NewParagraphModal from '@/components/modals/NewParagraphModal';
import NewDescriptionModal from '@/components/modals/NewDescriptionModal';
import RightColumn from '@/components/clientPortal/proposal/RightColumn';
import LeftColumn from '@/components/clientPortal/proposal/LeftColumn';
import { useNeedManagement } from '@/hooks/proposal/useNeedManagement';
import { useParagraphManagement } from '@/hooks/proposal/useParagraphManagement';
import { useDescriptionManagement } from '@/hooks/proposal/useDescriptionManagement';
import NewNeedModal from '@/components/modals/NewNeedModal';
import { useDragAndDrop } from '@/hooks/proposal/useDragAndDrop';
import { VscSend } from "react-icons/vsc";
import { createProposal, updateProposal } from '@/services/proposalService';
import { loadProposalData } from '@/hooks/proposal/useLoadData';
import { Button } from '@/components/common/Button';
import { toast } from 'react-toastify';
import { fetchProfilesWithUserDetails } from '@/services/profileService';
import { generateProposalEmailContent } from '@/lib/emailUtils';
import { sendEmailByContacts } from '@/services/emailService';
import ConfirmPublishModal from '@/components/clientPortal/proposal/ConfirmPublishModal';
import { deleteDefaultDescription, deleteDefaultParagraph, saveDefaultDescription, saveDefaultParagraph } from '@/services/proposalDefaultsService';


const notifyContacts = async (prospectId: string, proposalId: string | null, companyName: string) => {
  const contacts = await fetchProfilesWithUserDetails(prospectId);
  const proposalUrl = `${process.env.NEXT_PUBLIC_URL}/client-portal/proposal/${prospectId}/preview/${proposalId}`;
  const subject = "Nouvelle proposition commerciale";

  if (!contacts || contacts.length === 0) {
    console.error("Aucun contact trouvé pour notifier");
    return;
  }

  for (const contact of contacts) {
    const content = generateProposalEmailContent(proposalUrl, companyName, contact.firstname, contact.lastname);
    await sendEmailByContacts([contact], content, subject, false);
  }
};

const isDescriptionNotDefault = (descriptionItem: Item | undefined) => {
  return descriptionItem && !descriptionItem.isDefault;
};

const Proposal: React.FC = () => {
  const router = useRouter();
  const { id, proposalId } = router.query;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [prospect, setProspect] = useState<Company | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const newNeedModalState = useModalState();
  const newParagraphModalState = useModalState();
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const [nameProposal, setNameProposal] = useState('');
  const newDescriptionModalState = useModalState();
  const [switchEnabled, setSwitchEnabled] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus['status']>();
  const [paragraphsDefaultToSave, setParagraphsDefaultToSave] = useState<Item[]>([]);
  const [redirect, setRedirect] = useState(false);
  const [leftColumn, setLeftColumn] = useState<Item[]>([
    {
      id: 'description',
      type: 'description',
      name: 'Description du projet',
      showName: true,
      description: 'Ceci est la description initiale du projet.',
      content: (
        <div className="relative">
          <div className="font-medium">Description du projet</div>
          <div className='text-labelGray'>Ceci est la description initiale du projet.</div>
          <button
            onClick={() =>
              handleEditDescription({
                id: 'description',
                type: 'description',
                name: 'Description du projet',
                showName: true,
                description: 'Ceci est la description initiale du projet.',
                content: '',
              })
            }
            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
          >
            <GrFormEdit className="text-xl" />
          </button>
        </div>
      ),
    },
  ]);
  
  const [rightColumn, setRightColumn] = useState<Item[]>([
    { id: 'header', type: 'header', content: 'En-tête' },
    { id: 'price', type: 'price', content: 'Prix' },
  ]);

  const { handleAddNeed, handleEditNeed, handleModalSubmitNeed, currentNeed } = useNeedManagement(setLeftColumn, newNeedModalState);
  const { handleAddParagraph, handleModalSubmitParagraph, handleEditParagraph, currentParagraph } = useParagraphManagement(setLeftColumn, newParagraphModalState, setParagraphsDefaultToSave);
  const { handleEditDescription, handleModalSubmitDescription, currentDescription } = useDescriptionManagement(setLeftColumn, newDescriptionModalState);

  const handleSwitchChange = (value: boolean) => {
    setSwitchEnabled(value);
  };

  const handleSave = async (status: ProposalStatus['status'] = 'draft') => {
    setProposalStatus(status);
    if (!nameProposal.trim()) {
      setNameError("Le nom de la proposition est obligatoire.");
      setLoadingSave(false);
      return;
    }
    setNameError(null);
    setLoadingSave(true);
    const needs: Need[] = rightColumn
      .filter(item => item.type === 'need')
      .map(need => {
        return {
          name: need.name || '',
          description: need.description || '',
          quantity: need.quantity || 1,
          price: need.price || 0,
          showName: need.showName === true ? need.showName : false,
          showPrice: need.showPrice === true ? need.showPrice : false,
          showQuantity: need.showQuantity === true ? need.showQuantity : false,
      }
    });
  
    const paragraphs: Paragraph[] = rightColumn
      .filter(item => item.type === 'paragraph')
      .map(paragraph => ({
        name: paragraph.name || '',
        description: paragraph.description || '',
        showName: paragraph.showName === true ? paragraph.showName : false,
        isDefault: paragraph.isDefault === true ? paragraph.isDefault : false,
      }));

    if (paragraphsDefaultToSave.length > 0 && prospect?.company_id) {
      for (const paragraphDefault of paragraphsDefaultToSave) {
        await saveDefaultParagraph(
          prospect.company_id,
          paragraphDefault.name || '',
          paragraphDefault.description || '',
        );
      }
    }
    const descriptionItem = rightColumn.find(item => item.type === 'description');
    const descriptionItemLeft = leftColumn.find(item => item.type === 'description');
    const totalPrice = needs.reduce((sum, need) => sum + need.price, 0);
  
    if (prospect?.company_id && (isDescriptionNotDefault(descriptionItem) || isDescriptionNotDefault(descriptionItemLeft))) {
      await deleteDefaultDescription(prospect.company_id);
    } else if (prospect?.company_id && (!isDescriptionNotDefault(descriptionItem) || !isDescriptionNotDefault(descriptionItemLeft))) {
      const decriptionDefault = descriptionItem ? descriptionItem : descriptionItemLeft
      if (decriptionDefault) {
        await saveDefaultDescription(prospect.company_id, decriptionDefault?.description || '', decriptionDefault?.name || '')
      }
    }

    if (company && prospect && user) {
      const dataToSave: ProposalData = {
        name: nameProposal,
        companyId: company?.id,
        companyName: company?.name,
        companySiren: company?.siren || '',
        prospectId: prospect?.id,
        prospectName: prospect?.name,
        prospectSiren: prospect?.siren || '',
        createdBy: user?.id,
        title: descriptionItem?.name || '',
        showTitle: descriptionItem?.showName === true ? descriptionItem?.showName : false,
        description: descriptionItem?.description || '',
        totalPrice,
        needs,
        paragraphs,
        status,
        mention_realise: switchEnabled,
      };
    
      if (proposalId) {
        await updateProposal(proposalId as string, dataToSave);
        if (status === "proposed") {
          await notifyContacts(prospect.id, proposalId as string, company.name);
          toast.success('La proposition a bien été publiée.');
        } else {
          toast.success('La proposition a bien été mise à jour.');
        }
      } else {
        const { proposal } = await createProposal(dataToSave);
        if (status === "proposed") {
          await notifyContacts(prospect.id, proposal.id, company.name);
          toast.success('La proposition a bien été publiée.');
        } else {
          setRedirect(true);
          router.push(`/client-portal/proposal/${proposal.prospect_id}?proposalId=${proposal.id}`);
          toast.success('La proposition a bien été créée.');
        }
      }      
    }
    setParagraphsDefaultToSave([]);
    setLoadingSave(false);
  };
  

  const handlePublish = () => {
    handleSave('proposed');
    setIsPublishModalOpen(false);
  };

  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {
      const prospect = await fetchCompanyById(id);
      const company = await fetchTopMostParentCompanyCompanyById(id);
      setProspect(prospect);
      setCompany(company);
      await loadProposalData(
        proposalId as string,
        company,
        prospect,
        setLeftColumn,
        setRightColumn,
        handleEditDescription,
        handleEditNeed,
        handleEditParagraph,
        setProposalStatus,
        setNameProposal
      );
    } catch (err) {
      setError("Une erreur s'est produite lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { onDragEnd } = useDragAndDrop(leftColumn, setLeftColumn, rightColumn, setRightColumn);

  const handlePreviewClick = () => {
    router.push(`/client-portal/proposal/${prospect?.id}/preview/${proposalId}`);
  };

  const handleDeleteParagraph = async (paragraphId?: string) => {
    try {
      if (paragraphId && prospect?.company_id) {
        await deleteDefaultParagraph(prospect?.company_id, paragraphId);
        setLeftColumn((prev) => prev.filter(item => item.id !== paragraphId));
        toast.success('Paragraphe supprimé avec succès.');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du paragraphe.');
    }
  };
  

  if (redirect && !proposalId) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="bg-gray-100">
      <div className="flex justify-between space-x-4 px-16 mt-4 items-center">
        <div>
          <input
            type="text"
            value={nameProposal}
            onChange={(e) => setNameProposal(e.target.value)}
            placeholder="Nom de la proposition"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blueCustom focus:border-transparent"
          />
          {nameError && <p className="text-red-600 text-sm mt-1">{nameError}</p>}
        </div>
        <div className='flex space-x-4'>
          {proposalStatus !== "proposed" && "refused" && "accepted" ? <Button isLoading={loadingSave} disabled={loadingSave} onClick={() => handleSave('draft')} className="bg-white text-blueCustom border border-blueCustom px-4 py-2 rounded-md hover:bg-blue-100">Enregistrer</Button> : ''}
          {proposalId && <Button onClick={() => handlePreviewClick()} className="bg-white text-blueCustom border border-blueCustom px-4 py-2 rounded-md hover:bg-blue-100">Aperçu</Button>}
          {proposalStatus !== "proposed" && "refused" && "accepted" ? <Button isLoading={loadingSave} disabled={loadingSave} onClick={() => setIsPublishModalOpen(true)} className="bg-blueCustom text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">Publier <VscSend className='ml-2'/></Button> : ''}
        </div>
      </div>
      <div className="flex-grow p-8 mx-16 mt-4 bg-backgroundBlue rounded-2xl">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex justify-center space-x-8">
            <LeftColumn
              items={leftColumn}
              showExtraButtons={showExtraButtons}
              onAddParagraph={handleAddParagraph}
              onAddNeed={handleAddNeed}
              onToggleExtraButtons={setShowExtraButtons}
            />
            <RightColumn items={rightColumn} switchEnabled={switchEnabled} onSwitchChange={handleSwitchChange} />
          </div>
        </DragDropContext>
      </div>

      <NewNeedModal
        isOpen={newNeedModalState.isModalOpen}
        onRequestClose={() => newNeedModalState.closeModal()}
        onSubmit={handleModalSubmitNeed}
        initialData={currentNeed}
      />
      <NewParagraphModal
        isOpen={newParagraphModalState.isModalOpen}
        onRequestClose={newParagraphModalState.closeModal}
        onSubmit={handleModalSubmitParagraph}
        initialData={currentParagraph}
        onDelete={() => handleDeleteParagraph(currentParagraph?.id)}
      />
      <NewDescriptionModal
        isOpen={newDescriptionModalState.isModalOpen}
        onRequestClose={newDescriptionModalState.closeModal}
        onSubmit={handleModalSubmitDescription}
        initialData={currentDescription}
      />
      <ConfirmPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublish}
        message={`Êtes-vous sûr de vouloir publier ?`}
      />
    </div>
  );
};

export default Proposal;