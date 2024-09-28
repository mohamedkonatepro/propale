import ProposalPage from "@/components/clientPortal/proposal/ProposalPage";
import { useRouter } from "next/router";
import React from "react";

const ProposalPagePDF = () => {
  const router = useRouter();
  const { proposalId } = router.query;

  if (!proposalId) {
    return <div>Loading...</div>;
  }

  return <ProposalPage proposalId={proposalId as string} />;
};

export default ProposalPagePDF;
