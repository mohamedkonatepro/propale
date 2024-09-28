import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Proposal as IProposal } from '@/types/models';
import { FaPlus } from "react-icons/fa";
import { deleteProposal, getProposalsByProspectId } from '@/services/proposalService';
import ProposalTable from '@/components/DataTable/ProposalTable';
import { toast } from 'react-toastify';
import { ROLES } from '@/constants/roles';
import { Button } from '@/components/common/Button';
import { useUser } from '@/context/userContext';


const Proposal: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const { user } = useUser();

  const handleAddClick = () => {
    router.push(`/client-portal/proposal/${id}`);
  };

  const fetchProposals = async () => {
    try {
      const { proposals } = await getProposalsByProspectId(id as string);
      setProposals(proposals);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Une erreur s'est produite lors de la récupération des propositions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [id]);

  const handleDeleteClick = async (proposalId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette proposition ?")) {
      try {
        await deleteProposal(proposalId);
        toast.success("Proposition supprimée avec succès !");
        await fetchProposals();
      } catch (error) {
        toast.error("Erreur lors de la suppression de la proposition.");
        console.error(error);
      }
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="">
      <div className="flex justify-between px-16 mt-12">
        <h2 className='text-black font-bold text-2xl'>Vos propales</h2>
        {user?.role !== ROLES.PROSPECT && <Button onClick={handleAddClick} className="bg-blueCustom text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">Nouvelle propale <FaPlus className='ml-2'/></Button>}
      </div>
      <div className="flex-grow mx-16 rounded-2xl">
        <ProposalTable proposals={proposals} handleDeleteClick={handleDeleteClick} />
      </div>
    </div>
  );
};

export default Proposal;