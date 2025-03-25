import { Need, Paragraph, Profile, Proposal, ProposalData } from "@/types/models";
import { supabase } from '@/lib/supabaseClient';

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

export const getProposalsByProspectId = async (prospectId: string, user: Profile): Promise<{proposals: Proposal[]}> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/proposals?prospectId=${prospectId}&role=${user.role}`, {
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


export const updateProposalStatus = async (proposalId: string, status: string): Promise<Proposal> => {
  if (!proposalId || !status) {
    throw new Error('Proposal ID and status are required');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/proposals/${proposalId}/update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(`Error updating status: ${errorResponse.error}`);
    }

    const data = await response.json();
    return data.proposal;
  } catch (error) {
    console.error('Failed to update proposal status:', error);
    throw new Error('Error updating proposal status');
  }
};

// Business logic methods for direct database operations

export const createProposalWithDetails = async (data: ProposalData): Promise<{
  proposal: Proposal;
  needs: Need[];
  paragraphs: Paragraph[];
}> => {
  try {
    // Create the proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert([{
        name: data.name,
        company_id: data.companyId,
        company_name: data.companyName,
        company_siren: data.companySiren,
        prospect_id: data.prospectId,
        prospect_name: data.prospectName,
        prospect_siren: data.prospectSiren,
        created_by: data.createdBy,
        status: data.status,
        title: data.title,
        description: data.description,
        show_title: data.showTitle,
        total_price: data.totalPrice,
        mention_realise: data.mention_realise
      }])
      .select('*')
      .single<Proposal>();

    if (proposalError) {
      throw new Error(proposalError.message);
    }

    // Insert needs
    const needsToInsert = data.needs.map((need: Need, index: number) => ({
      proposal_id: proposal.id,
      name: need.name,
      description: need.description,
      quantity: need.quantity,
      price: need.price,
      show_name: need.showName,
      show_price: need.showPrice,
      show_quantity: need.showQuantity,
      order_position: index
    }));

    const { data: needsData, error: needsError } = await supabase
      .from('proposal_needs')
      .insert(needsToInsert)
      .select('*');

    if (needsError) {
      throw new Error(needsError.message);
    }

    // Insert paragraphs
    const paragraphsToInsert = data.paragraphs.map((paragraph: Paragraph, index: number) => ({
      proposal_id: proposal.id,
      name: paragraph.name,
      description: paragraph.description,
      show_name: paragraph.showName,
      order_position: index
    }));

    const { data: paragraphsData, error: paragraphsError } = await supabase
      .from('proposal_paragraphs')
      .insert(paragraphsToInsert)
      .select('*');

    if (paragraphsError) {
      throw new Error(paragraphsError.message);
    }

    return { proposal, needs: needsData, paragraphs: paragraphsData };
  } catch (error) {
    console.error('Error creating proposal with details:', error);
    throw error;
  }
};
