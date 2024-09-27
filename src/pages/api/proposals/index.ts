import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Proposal, Need, Paragraph } from '@/types/models';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method === 'GET') {
    const { prospectId } = req.query;

    if (!prospectId || typeof prospectId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing prospectId' });
    }

    try {
      const { data: proposals, error: proposalError } = await supabase
        .from('proposals')
        .select('*')
        .eq('prospect_id', prospectId);

      if (proposalError || !proposals) {
        return res.status(404).json({ error: 'Proposals not found' });
      }


      return res.status(200).json({ proposals });
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
