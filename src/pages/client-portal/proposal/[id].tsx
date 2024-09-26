import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Company, Item, NeedFormData } from '@/types/models';
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
import { getStepperSession } from '@/services/stepperService';
import { GrFormEdit } from 'react-icons/gr';
import NewParagraphModal from '@/components/modals/NewParagraphModal';
import NewDescriptionModal from '@/components/modals/NewDescriptionModal';
import RightColumn from '@/components/clientPortal/proposal/RightColumn';
import LeftColumn from '@/components/clientPortal/proposal/LeftColumn';
import { useNeedManagement } from '@/hooks/proposal/useNeedManagement';
import { useParagraphManagement } from '@/hooks/proposal/useParagraphManagement';
import { useDescriptionManagement } from '@/hooks/proposal/useDescriptionManagement';
import NeedContent from '@/components/clientPortal/proposal/NeedContent';
import NewNeedModal from '@/components/modals/NewNeedModal';
import { useDragAndDrop } from '@/hooks/proposal/useDragAndDrop';
import { VscSend } from "react-icons/vsc";


const Proposal: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prospect, setProspect] = useState<Company | null>(null);
  const [statusOption, setStatusOption] = useState<Option>();
  const newNeedModalState = useModalState();
  const newParagraphModalState = useModalState();
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const newDescriptionModalState = useModalState();
  const [switchEnabled, setSwitchEnabled] = useState(true);
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
  const { handleAddParagraph, handleModalSubmitParagraph, currentParagraph } = useParagraphManagement(setLeftColumn, newParagraphModalState);
  const { handleEditDescription, handleModalSubmitDescription, currentDescription } = useDescriptionManagement(setLeftColumn, newDescriptionModalState);

  const handleSwitchChange = (value: boolean) => {
    setSwitchEnabled(value);
  };

  const handleSave = () => {
    console.log(rightColumn, switchEnabled);
    // Ajoutez ici la logique pour sauvegarder la proposition
    console.log("Sauvegarde des données...");
  };

  const handlePublish = () => {
    // Ajoutez ici la logique pour publier la proposition
    console.log("Publication de la proposition...");
  };

  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {
      const prospect = await fetchCompanyById(id);
      const company = await fetchTopMostParentCompanyCompanyById(id);
      setProspect(prospect);
      if (prospect?.status) {
        setStatusOption(getOption(prospect.status, statuses));
      }
      if (company && prospect) {
        const savedSession = await getStepperSession(company.id, prospect.id);
        // Logique pour filtrer et combiner les éléments de type "need"
        const combinedNeeds = savedSession?.responses
          ?.filter(response => response.product_id) // On filtre les éléments avec product_id (les "needs")
          ?.reduce((acc, response) => {
            const existingNeed = acc.find(need => need.id === response.product_id);
            if (existingNeed && existingNeed.quantity) {
              existingNeed.quantity += response.product_quantity; // Si doublon, on additionne les quantités
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

        // Mettre à jour la colonne gauche avec les "needs" combinés
        const newNeeds = combinedNeeds.map(need => ({
          id: need.id || '',
          type: 'need' as 'need',
          name: need.name,
          quantity: need.quantity,
          price: need.price,
          description: need.description,
          showPrice: true,
          showTitle: true,
          content: React.createElement(NeedContent, { data: {...need, quantity: need.quantity?.toString(), price: need.price?.toString()} as NeedFormData, id: need.id || '', onEdit: handleEditNeed }),
        }));

        setLeftColumn((prev) => [
          ...prev.filter((item: Item) => item.type !== 'need'),
          ...newNeeds
        ])
      }
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

      {/* Boutons en haut à droite */}
      <div className="flex justify-end space-x-4 px-16 mt-4">
        <button onClick={handleSave} className="bg-white text-blueCustom border border-blueCustom px-4 py-2 rounded-md hover:bg-blue-100">Enregistrer</button>
        <button onClick={handlePublish} className="bg-blueCustom text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">Publier <VscSend className='ml-2'/></button>
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
