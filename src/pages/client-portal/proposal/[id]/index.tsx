import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Company, Item, Need, Paragraph, ProposalData, ProposalStatus } from '@/types/models';
import { fetchCompanyById, fetchTopMostParentCompanyCompanyById } from '@/services/companyService';
import { useUser } from '@/context/userContext';
import { statuses, Option } from '@/constants';
import Header from '@/components/layout/Header';
import ProspectNavBar from '@/components/clientPortal/ProspectNavBar';
import useModalState from '@/hooks/useModalState';
import { getOption } from '@/lib/utils';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ROLES } from '@/constants/roles';
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
  const [statusOption, setStatusOption] = useState<Option>();
  const newNeedModalState = useModalState();
  const newParagraphModalState = useModalState();
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const [nameProposal, setNameProposal] = useState('');
  const newDescriptionModalState = useModalState();
  const [switchEnabled, setSwitchEnabled] = useState(true);
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus['status']>();
  const [leftColumn, setLeftColumn] = useState<Item[]>([
    {
      id: 'description',
      type: 'description',
      name: 'Description du projet',
      showName: true,
      description: 'Ceci est la description initiale du projet.',
      content: (
        <div className="relative">
          <div className="font-bold">Description du projet</div>
          <div>Ceci est la description initiale du projet.</div>
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
  const { handleAddParagraph, handleModalSubmitParagraph, handleEditParagraph, currentParagraph } = useParagraphManagement(setLeftColumn, newParagraphModalState);
  const { handleEditDescription, handleModalSubmitDescription, currentDescription } = useDescriptionManagement(setLeftColumn, newDescriptionModalState);

  const handleSwitchChange = (value: boolean) => {
    setSwitchEnabled(value);
  };

  const handleSave = async (status: ProposalStatus['status'] = 'draft') => {
    if (!nameProposal.trim()) {
      setNameError("Le nom de la proposition est obligatoire.");
      setLoadingSave(false);
      return;
    }
    setNameError(null);
    setLoadingSave(true);
    const needs: Need[] = rightColumn
      .filter(item => item.type === 'need')
      .map(need => ({
        name: need.name || '',
        description: need.description || '',
        quantity: need.quantity || 1,
        price: need.price || 0,
        showName: need.showName || true,
        showPrice: need.showPrice || true,
      }));
  
    const paragraphs: Paragraph[] = rightColumn
      .filter(item => item.type === 'paragraph')
      .map(paragraph => ({
        name: paragraph.name || '',
        description: paragraph.description || '',
        showName: paragraph.showName || true,
      }));
  
    const descriptionItem = rightColumn.find(item => item.type === 'description');
    const totalPrice = needs.reduce((sum, need) => sum + (need.price * need.quantity), 0);
  
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
        showTitle: descriptionItem?.showName || true,
        description: descriptionItem?.description || '',
        totalPrice,
        needs,
        paragraphs,
        status,
        mention_realise: switchEnabled,
      };
    
      if (proposalStatus === 'draft' && proposalId) {
        await updateProposal(proposalId as string, dataToSave);
        toast.success('La proposition a bien été mise à jour.');
      } else {
        await createProposal(dataToSave);
        toast.success('La proposition a bien été créée.');
      }      
    }
    setLoadingSave(false);
  };
  

  const handlePublish = () => {
    handleSave('accepted');
    console.log("Publication de la proposition...");
  };

  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {
      const prospect = await fetchCompanyById(id);
      const company = await fetchTopMostParentCompanyCompanyById(id);
      setProspect(prospect);
      setCompany(company);
      if (prospect?.status) {
        setStatusOption(getOption(prospect.status, statuses));
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const { onDragEnd } = useDragAndDrop(leftColumn, setLeftColumn, rightColumn, setRightColumn);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className='flex px-8 py-5 bg-white justify-between items-center shadow-md'>
        {statusOption && <Header title={prospect?.name} badgeName={statusOption.label} badgeColor={statusOption.color} siren={prospect?.siren} />}
        {user?.role !== ROLES.PROSPECT ? (
          <Link className="text-blue-600 hover:text-blue-800 transition-colors" href={`/dashboard/prospect/${prospect?.company_id}`}>Retour</Link>
        ) : (
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
            Se déconnecter
          </button>
        )}
      </header>

      <div className='flex justify-center mt-6'>
        <ProspectNavBar active="proposal" prospectId={id as string} />
      </div>

      <div className="flex justify-between space-x-4 px-16 mt-4 items-center">
        <div>
          <input
            type="text"
            value={nameProposal}
            onChange={(e) => setNameProposal(e.target.value)}
            placeholder="Nom de la proposition"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {nameError && <p className="text-red-600 text-sm mt-1">{nameError}</p>}
        </div>
        <div className='flex space-x-4'>
          <Button isLoading={loadingSave} disabled={loadingSave} onClick={() => handleSave('draft')} className="bg-white text-blueCustom border border-blueCustom px-4 py-2 rounded-md hover:bg-blue-100">Enregistrer</Button>
          <Button isLoading={loadingSave} disabled={loadingSave} onClick={handlePublish} className="bg-blueCustom text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">Publier <VscSend className='ml-2'/></Button>
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
      />
      <NewDescriptionModal
        isOpen={newDescriptionModalState.isModalOpen}
        onRequestClose={newDescriptionModalState.closeModal}
        onSubmit={handleModalSubmitDescription}
        initialData={currentDescription}
      />
    </div>
  );
};

export default Proposal;