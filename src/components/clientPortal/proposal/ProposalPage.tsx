import React, { useEffect, useState, useRef } from "react";
import { getProposalById } from "@/services/proposalService";
import { Proposal, Need, Paragraph } from "@/types/models";

const ProposalPage = ({ proposalId }: { proposalId: string }) => {
  const [proposalData, setProposalData] = useState<Proposal | null>(null);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { proposal, needs, paragraphs } = await getProposalById(proposalId);
        setProposalData(proposal);
        setNeeds(needs);
        setParagraphs(paragraphs);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch proposal data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!proposalData) {
    return <div>Failed to load proposal data</div>;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col" ref={contentRef}>
      <div className="max-w-2xl w-full mx-auto bg-white print:shadow-none print:border-none flex-grow" id="proposal-content">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="mt-7">
            <h1 className="text-3xl font-bold text-blue-600">Proposition commerciale</h1>
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
            <p className="text-sm text-gray-500 mt-10">Le {new Date(proposalData.updated_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Description Section */}
        {proposalData.description && (
          <div className="mb-6">
            {proposalData.show_title && <h2 className="text-xl font-bold text-blue-600">{proposalData.title}</h2>}
            <p className="text-gray-600 mt-2">{proposalData.description}</p>
          </div>
        )}

        {/* Needs Section */}
        {needs.length > 0 && (
          <div className="mb-6 break-inside-avoid">
            <h2 className="text-xl font-bold text-blue-600">Besoins</h2>
            {needs.map((need, index) => (
              <div key={index} className="mb-4">
                {need.showPrice && <h3 className="text-lg font-semibold text-gray-800">{need.name}</h3>}
                {need.showName && <p className="text-gray-600">{need.price.toLocaleString()} €</p>}
                <p className="text-gray-500 mt-1">{need.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Total Section */}
        <div className="flex justify-between items-center mt-8 border-t pt-4">
          <p className="text-gray-600 font-semibold">Total :</p>
          <p className="text-gray-800 font-bold text-lg">{proposalData.total_price.toLocaleString()} € HT</p>
        </div>

        {/* Additional Content - Paragraphs */}
        {paragraphs.length > 0 && (
          <div className="mt-10 break-inside-avoid">
            {paragraphs.map((paragraph, index) => (
              <div key={index} className="mb-4">
                {paragraph.showName && <h3 className="text-lg font-semibold text-gray-800">{paragraph.name}</h3>}
                <p className="text-gray-500 mt-1">{paragraph.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      {proposalData.mention_realise && <div className="max-w-3xl bg-white mx-auto flex-grow py-8 text-center text-gray-500 text-sm print:fixed print:bottom-0 print:left-0 print:right-0 print:py-4 print:bg-white">
        <p className="mt-8">
          Réalisé avec <span className="font-semibold text-blue-600">Propale</span>
        </p>
      </div>}
    </div>
  );
};

export default ProposalPage;
