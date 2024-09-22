import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { companyId, search } = req.query;

  if (req.method === 'GET') {
    let query = supabase
      .from('company')
      .select('*')
      .eq('company_id', companyId)
      .eq('type', 'prospect');

    if (search) {
      query = query.or(`name.ilike.%${search}%,siren.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error fetching prospects' });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
