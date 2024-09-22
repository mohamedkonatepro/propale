import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { parentId } = req.query;

  if (req.method === 'GET') {
    const { count, error } = await supabase
      .from('company')
      .select('id', { count: 'exact' })
      .eq('company_id', parentId);

    if (error) {
      return res.status(500).json({ error: 'Error counting companies' });
    }

    return res.status(200).json({ count: count ?? 0 });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
