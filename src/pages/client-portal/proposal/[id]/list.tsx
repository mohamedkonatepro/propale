import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Proposal as IProposal, Profile, ProposalStatus } from '@/types/models';
import { FaPlus } from "react-icons/fa";
import { deleteProposal, getProposalsByProspectId, updateProposalStatus } from '@/services/proposalService';
import ProposalTable from '@/components/DataTable/ProposalTable';
import { toast } from 'react-toastify';
import { ROLES } from '@/constants/roles';
import { Button } from '@/components/common/Button';
import { useUser } from '@/context/userContext';
import { updateProspectStatus } from '@/services/companyService';
import ActionModal from '@/components/modals/ActionModal';
import useModalState from '@/hooks/useModalState';

const Proposal: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const { user } = useUser();
  const confirmModalState = useModalState();
  const [currentProposal, setCurrentProposal] = useState<IProposal | null>(null);
  const [statusProposal, setStatusProposal] = useState<ProposalStatus['status'] | null>(null);

  const handleAddClick = () => {
    router.push(`/client-portal/proposal/${id}`);
  };

  const fetchProposals = async (user: Profile) => {
    try {
      const { proposals } = await getProposalsByProspectId(id as string, user);
      setProposals(proposals);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors de la récupération des propositions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProposals(user);
  }, [id, user]);

  const handleDeleteClick = async (proposalId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette proposition ?")) {
      try {
        await deleteProposal(proposalId);
        toast.success("Proposition supprimée avec succès !");
        if (user) fetchProposals(user);
      } catch (error) {
        toast.error("Erreur lors de la suppression de la proposition.");
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (proposal: IProposal, newStatus: ProposalStatus['status']) => {
    try {
      await updateProposalStatus(proposal.id, newStatus);

      if (newStatus === "refused") {
        await updateProspectStatus(proposal.prospect_id, "lost");
      } else if (newStatus === "accepted") {
        await updateProspectStatus(proposal.prospect_id, "concluded");
      }

      if (user) fetchProposals(user);
      toast.success(`Proposition ${newStatus === "accepted" ? "acceptée" : "refusée"} avec succès !`);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la proposition.");
      console.error(error);
    } finally {
      confirmModalState.closeModal();
    }
  };

  const handleStatusChangeWithConfirmation = (proposal: IProposal, newStatus: ProposalStatus['status']) => {
    if (newStatus === "accepted" || newStatus === "refused") {
      setCurrentProposal(proposal);
      setStatusProposal(newStatus);
      confirmModalState.openModal();
    } else {
      handleStatusChange(proposal, newStatus);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div>
      <div className="flex justify-between px-16 mt-12">
        <h2 className="text-black font-medium text-2xl">Vos propales</h2>
        {user?.role !== ROLES.PROSPECT && (
          <Button
            onClick={handleAddClick}
            className="bg-blueCustom text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            Nouvelle propale <FaPlus className="ml-2" />
          </Button>
        )}
      </div>

      <div className="flex-grow mx-16 rounded-2xl">
        <ProposalTable
          proposals={proposals}
          handleDeleteClick={handleDeleteClick}
          handleStatusChange={handleStatusChangeWithConfirmation}
        />
      </div>

      <ActionModal
        isOpen={confirmModalState.isModalOpen}
        onClose={confirmModalState.closeModal}
        onConfirm={() => currentProposal && statusProposal && handleStatusChange(currentProposal, statusProposal)}
        title={`Confirmer ${statusProposal === "accepted" ? "l'acceptation" : "le refus"}`}
        message=""
        cancelButtonText="Annuler"
        confirmButtonText="Confirmer"
        icon="/uil-sign-out-alt.svg"
      />
    </div>
  );
};

export default Proposal;
