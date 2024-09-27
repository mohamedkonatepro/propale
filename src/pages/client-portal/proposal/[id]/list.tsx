import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Company, Proposal as IProposal, Item, Need, Paragraph, ProposalData, ProposalStatus } from '@/types/models';
import { fetchCompanyById, fetchTopMostParentCompanyCompanyById } from '@/services/companyService';
import { useUser } from '@/context/userContext';
import { statuses, Option } from '@/constants';
import Header from '@/components/layout/Header';
import ProspectNavBar from '@/components/clientPortal/ProspectNavBar';
import { getOption } from '@/lib/utils';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ROLES } from '@/constants/roles';
import { FaPlus } from "react-icons/fa";
import { deleteProposal, getProposalsByProspectId } from '@/services/proposalService';
import ProposalTable from '@/components/DataTable/ProposalTable';
import { toast } from 'react-toastify';


const Proposal: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prospect, setProspect] = useState<Company | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [statusOption, setStatusOption] = useState<Option>();
  const [proposals, setProposals] = useState<IProposal[]>([]);

  const handleAddClick = () => {
    router.push(`/client-portal/proposal/${id}`);
  };
  const loadData = useCallback(async () => {
    if (typeof id !== 'string' || !user?.id) return;

    setLoading(true);
    try {
      const prospect = await fetchCompanyById(id);
      // const company = await fetchTopMostParentCompanyCompanyById(id);
      setProspect(prospect);
      // setCompany(company);
      if (prospect?.status) {
        setStatusOption(getOption(prospect.status, statuses));
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

  const handleDownloadPdf = (proposal: IProposal) => {
    console.log('Télécharger PDF pour la propale :', proposal);
  };

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
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };


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

      <div className="flex justify-between px-16 mt-12">
        <h2 className='text-black font-bold text-2xl'>Vos propales</h2>
        <button onClick={handleAddClick} className="bg-blueCustom text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">Nouvelle propale <FaPlus className='ml-2'/></button>
      </div>
      <div className="flex-grow mx-16 rounded-2xl">
        <ProposalTable proposals={proposals} handleDownloadPdf={handleDownloadPdf} handleDeleteClick={handleDeleteClick} />
      </div>
    </div>
  );
};

export default Proposal;