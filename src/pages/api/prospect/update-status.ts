import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);

  if (req.method === 'PUT') {
    const { prospectId } = req.query;
    const { status } = req.body;

    if (!prospectId || typeof prospectId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing prospect ID' });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing status' });
    }

    try {
      const { error } = await supabase
        .from('company')
        .update({ status })
        .eq('id', prospectId)
        .eq('type', 'prospect'); // Ensure we're only updating prospects

      if (error) {
        return res.status(500).json({ error: `Failed to update prospect status: ${error.message}` });
      }

      return res.status(200).json({ message: 'Prospect status updated successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: `Failed to update prospect status: ${error.message}` });
      }
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
