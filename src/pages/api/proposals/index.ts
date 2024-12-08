import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Proposal, Need, Paragraph } from '@/types/models';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';
import { ROLES } from '@/constants/roles';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method === 'GET') {
    const { prospectId, role } = req.query;

    if (!prospectId || typeof prospectId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing prospectId' });
    }

    const access = role !== ROLES.PROSPECT
    try {
      let query = supabase.from('proposals').select('*');

      if (!access) {
        query = query.neq('status', 'draft');
      }
      
      const { data: proposals, error: proposalError } = await query.eq('prospect_id', prospectId);
      

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
