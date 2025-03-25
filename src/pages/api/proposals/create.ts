// pages/api/proposals/create.ts
import corsMiddleware, { cors } from '@/lib/corsMiddleware';
import { ProposalData } from '@/types/models';
import { createProposalWithDetails } from '@/services/proposalService';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  
  if (req.method === 'POST') {
    try {
      const proposalData: ProposalData = req.body;
      const result = await createProposalWithDetails(proposalData);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      return res.status(500).json({ error: error.message || 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
