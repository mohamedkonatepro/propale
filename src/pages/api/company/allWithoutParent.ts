import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const search = req.query.search as string || '';

  if (req.method === 'GET') {
    let query = supabase
      .from('company')
      .select('*')
      .is('company_id', null)
      .is('type', null);

    if (search) {
      query = query.or(`name.ilike.%${search}%,siren.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error fetching companies without parent.' });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
