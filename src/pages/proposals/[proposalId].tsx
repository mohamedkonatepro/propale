import { GetServerSideProps, NextPage } from 'next';
import React from 'react';
import { getProposalById } from "@/services/proposalService";
import { Proposal, Need, Paragraph } from "@/types/models";
import { format } from 'date-fns';
import { formatAmount } from '@/lib/utils';

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
            <svg width="30" height="30" viewBox="0 0 62 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M31.2045 17.4461C31.2045 17.4461 32.9887 20.2495 34.1442 21.4078C41.3834 28.6661 48.0353 32.9454 61.4347 32.4807L61.4031 51.971C60.9215 52.0138 60.4565 51.971 60.0218 51.971C54.9696 51.9796 49.9167 51.9529 44.8647 51.9974C44.1844 52.0034 43.7131 51.9974 43.7131 51.9974C43.7131 51.9974 44.5935 42.7887 39.0322 33.6513C38.2547 32.3458 36.3814 29.8158 34.4605 27.8326C33.2847 26.6281 32.0158 25.517 30.6655 24.5095C30.6655 24.5095 22.6589 30.5104 20.1004 40.1353C19.2738 43.303 18.5835 45.809 19.0664 50.6853C19.0377 51.1218 19.0377 51.5597 19.0664 51.9962C19.0664 51.9962 17.7688 52.0025 17.0199 51.9962C11.9118 51.952 6.80332 51.9524 1.69443 51.9976C1.046 52.0042 0.0769386 51.9383 0.0769386 51.9383L0.0268669 32.5061C0.0268669 32.5061 2.03625 32.617 2.53397 32.6115C12.5951 32.5031 19.5616 28.7889 26.4031 22.2437C27.4411 21.2507 29.1964 18.7257 29.1964 18.7257L30.6255 16.467" fill="#0147FE"/>
              <path d="M25.2078 9.6783C16.8827 16.8222 11.2118 18.3289 2.35396 18.6835C1.57689 18.6895 0.800285 18.644 0.0292892 18.5474C0.0292892 18.5474 -0.0364723 18.1901 0.0292892 16.9304C0.308857 11.587 1.6164 6.48186 3.61126 1.52739C4.04239 0.457041 4.64441 -0.00279382 5.85866 0.000691037C22.4082 0.0354289 38.958 0.0389138 55.5081 0.0111456C56.1398 0.0103159 56.6406 0.0916291 57.0622 0.438289C57.3038 0.656714 57.4898 0.929023 57.605 1.23284C59.8098 6.42212 60.9853 11.8334 61.4331 17.4339C61.5641 19.072 61.3467 18.5648 59.4993 18.6911C48.5897 18.6861 43.3929 16.1241 34.9755 8.35273C33.7083 7.09386 30.7232 2.57998 30.7232 2.57998" fill="#0147FE"/>
            </svg>
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
