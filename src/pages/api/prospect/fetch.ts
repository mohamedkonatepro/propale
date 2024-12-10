import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { companyId, search } = req.query;
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  
  if (req.method === 'GET') {
    let query = supabase
      .from('company')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .eq('type', 'prospect')
      .range(from, to);
  
    if (search) {
      query = query.or(`name.ilike.%${search}%,siren.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error fetching prospects' });
    }

    return res.status(200).json({data, count});
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
