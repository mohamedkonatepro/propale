import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { getProposalById } from '@/services/proposalService'; // Update this to your correct path for fetching proposals
import { Proposal, Need, Paragraph } from '@/types/models';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { useRouter } from 'next/router';
import ProposalPage from '@/pages/proposals/[proposalId]';
import { FaArrowLeft } from 'react-icons/fa';
import { VscSend } from 'react-icons/vsc';
import { CiFileOn } from "react-icons/ci";

const ProposalPreview: NextPage = () => {
  const [proposalData, setProposalData] = useState<Proposal | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { proposalId } = router.query;

  const handleEditClick = (proposal: Proposal) => {
    router.push(`/client-portal/proposal/${proposal.prospect_id}?proposalId=${proposal.id}`);
  };
  useEffect(() => {
    if (proposalId) {
      // Fetch data for the proposal using proposalId from query params
      getProposalById(proposalId as string)
        .then(({ proposal, needs, paragraphs }) => {
          setProposalData(proposal);
          setNeeds(needs);
          setParagraphs(paragraphs);
        })
        .catch((error) => {
          console.error('Failed to fetch proposal data:', error);
          setError('Failed to load proposal data');
        })
        .finally(() => setLoading(false));
    }
  }, [proposalId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !proposalData) {
    return <div>{error || 'Proposal data not available'}</div>;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <header className="bg-white py-4 shadow-lg flex justify-between items-center px-8">
        <Link href={`/client-portal/proposal/${proposalData.prospect_id}/list`} className="text-blueCustom text-sm flex items-center">
          <FaArrowLeft className='text-blueCustom' /> <div className='ml-2 text-blueCustom'>Liste des propales</div>
        </Link>
        <div>
          <div className='flex text-black items-center justify-center'>
            <CiFileOn className='mr-2' /> Proposition commercial
          </div>
          <div className={`${proposalData.status === 'accepted' ? 'text-green-500' : 'text-gray-500'} text-center`}>
            {proposalData.status === 'accepted' ? 'Publiée le ' : 'modifié le '} {format(new Date(proposalData.updated_at), 'dd/MM/yyyy')}
          </div>
        </div>
        {proposalData.status !== 'accepted' && proposalData.status !== 'refused' && <div className="flex items-center space-x-4">
          <Button onClick={() => handleEditClick(proposalData)} className="px-4 py-2 bg-white text-blueCustom border border-blueCustom rounded-md hover:bg-blue-200">Modifier</Button>
          <Button disabled={true} className="bg-blueCustom text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">Publier <VscSend className='ml-2'/></Button>
        </div>}
      </header>
      <div className='flex justify-center items-center mt-10'>
        <ProposalPage proposalData={proposalData} needs={needs} paragraphs={paragraphs} classCss=" w-full max-w-3xl px-10 shadow-lg" />
      </div>
    </div>
  );
};

export default ProposalPreview;
