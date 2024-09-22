import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { companyId } = req.query;
  const search = req.query.search as string || '';

  if (req.method === 'GET') {
    let query = supabase
      .from('company')
      .select('*')
      .eq('company_id', companyId)
      .is('type', null);

    if (search && search.length >= 3) {
      query = query.or(`name.ilike.%${search}%,siret.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error fetching companies.' });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
