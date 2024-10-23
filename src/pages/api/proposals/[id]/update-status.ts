import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  if (req.method === 'PUT') {
    const { id: proposalId } = req.query;
    const { status }: { status: string } = req.body;

    if (!proposalId || typeof proposalId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing proposal ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    try {
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', proposalId)
        .select('*')
        .single();

      if (proposalError) {
        return res.status(500).json({ error: proposalError.message });
      }

      return res.status(200).json({ proposal });
    } catch (error) {
      return res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
