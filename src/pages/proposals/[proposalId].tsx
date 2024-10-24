import { GetServerSideProps, NextPage } from 'next';
import React from 'react';
import { getProposalById } from "@/services/proposalService";
import { Proposal, Need, Paragraph } from "@/types/models";
import { format } from 'date-fns';
import { formatAmount } from '@/lib/utils';
import Image from 'next/image';

interface ProposalPageProps {
  proposalData: Proposal | null;
  needs: Need[];
  paragraphs: Paragraph[];
  classCss?: string;
}

const ProposalPage: NextPage<ProposalPageProps> = ({ proposalData, needs, paragraphs, classCss = "min-h-screen" }) => {
  if (!proposalData) {
    return <div>Failed to load proposal data</div>;
  }

  return (
    <div className={`bg-white ${classCss} flex flex-col`}>
      <div className="max-w-2xl w-full mx-auto bg-white print:shadow-none print:border-none flex-grow" id="proposal-content">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 break-inside-avoid">
          <div className="mt-7">
            <h1 className="text-3xl font-bold text-blueCustom">Proposition commerciale</h1>
            <div className="mt-10">
              <p className="text-sm text-gray-500">Destinée à</p>
              <div className="flex items-center space-x-2">
                <div>
                  <p className="font-bold text-lg">{proposalData.prospect_name}</p>
                  <p className="text-sm text-gray-500">SIREN : {proposalData.prospect_siren}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h5 className="text-lg font-semibold text-black">{proposalData.company_name}</h5>
            <p className="text-sm text-gray-500 mt-10">Le {format(new Date(proposalData.updated_at), 'dd/MM/yyyy')}</p>
          </div>
        </div>

        {/* Description Section */}
        {proposalData.description && (
          <div className="mb-6 break-inside-avoid">
            {proposalData.show_title && <h2 className="text-xl font-bold text-blueCustom">{proposalData.title}</h2>}
            <p className="text-gray-600 mt-2 text-left text-justify whitespace-pre-line">{proposalData.description}</p>
          </div>
        )}

        {/* Needs Section */}
        {needs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blueCustom">Besoins</h2>
            {needs.map((need, index) => (
              <div key={index} className="mb-4 break-inside-avoid">
                {need.showName && <h3 className="text-lg font-semibold text-gray-800">{need.name}</h3>}
                {need.showPrice && <p className="text-gray-600">{formatAmount(need.price)} €</p>}
                {need.showQuantity && <p className="text-gray-600">{`nombre de JH : ${need.quantity}`}</p>}
                <p className="text-gray-500 mt-1 text-left text-justify whitespace-pre-line">{need.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Total Section */}
        <div className="flex justify-between items-center mt-8 border-t pt-4 break-inside-avoid">
          <p className="text-gray-600 font-semibold">Total :</p>
          <p className="text-gray-800 font-bold text-lg">{formatAmount(proposalData.total_price)} € HT</p>
        </div>

        {/* Additional Content - Paragraphs */}
        {paragraphs.length > 0 && (
          <div className="mt-10">
            {paragraphs.map((paragraph, index) => (
              <div key={index} className="mb-4 break-inside-avoid">
                {paragraph.showName && <h3 className="text-lg font-semibold text-gray-800">{paragraph.name}</h3>}
                <p className="text-gray-500 mt-1 text-left text-justify whitespace-pre-line">{paragraph.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      {proposalData.mention_realise ? (
        <footer className="max-w-3xl w-full bg-white mx-auto py-8 text-center text-gray-500 text-sm print:fixed print:bottom-0 print:left-0 print:right-0 print:py-4 print:bg-white">
          <div className="flex items-center justify-center space-x-2">
            <span>Réalisé avec</span>
            <Image src="/logo.svg" alt="Propale" width={25} height={25} className="mr-2" />
            <span className="font-semibold text-blueCustom">Propale</span>
          </div>
        </footer>
      ) : (
        <footer className="max-w-3xl w-full bg-white mx-auto py-8 text-center text-gray-500 text-sm print:fixed print:bottom-0 print:left-0 print:right-0 print:py-4 print:bg-white"></footer>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ProposalPageProps> = async (context) => {
  const { proposalId } = context.params as { proposalId: string };

  try {
    const { proposal, needs, paragraphs } = await getProposalById(proposalId);
    return {
      props: {
        proposalData: proposal,
        needs,
        paragraphs,
      },
    };
  } catch (error) {
    console.error("Failed to fetch proposal data:", error);
    return {
      props: {
        proposalData: null,
        needs: [],
        paragraphs: [],
      },
    };
  }
};

export default ProposalPage;
