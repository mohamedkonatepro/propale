import { Need, Paragraph, Proposal, ProposalData } from "@/types/models";

export const createProposal = async (data: ProposalData): Promise<{
  proposal: Proposal;
  needs: Need[];
  paragraphs: Paragraph[];
}> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/proposals/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

export const getProposalById = async (proposalId: string): Promise<{
  proposal: Proposal;
  needs: Need[];
  paragraphs: Paragraph[];
}> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/proposals/${proposalId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result: {
      proposal: Proposal;
      needs: Need[];
      paragraphs: Paragraph[];
    } = await response.json();

    return result;
  } catch (error) {
    console.error('Error fetching proposal by ID:', error);
    throw error;
  }
};

export const updateProposal = async (proposalId: string, proposalData: ProposalData): Promise<{
  proposal: Proposal;
  needs: Need[];
  paragraphs: Paragraph[];
}> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/proposals/update?id=${proposalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(proposalData),
  });

  if (!response.ok) {
    throw new Error('Failed to update proposal');
  }

  return response.json();
};

export const getProposalsByProspectId = async (prospectId: string): Promise<{proposals: Proposal[]}> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/proposals?prospectId=${prospectId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching proposals by prospect ID:', error);
    throw error;
  }
};

export const deleteProposal = async (proposalId: string): Promise<void> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/proposals/${proposalId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting proposal:', error);
    throw error;
  }
};