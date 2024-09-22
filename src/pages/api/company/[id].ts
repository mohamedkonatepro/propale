import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('company')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error fetching company' });
    }

    return res.status(200).json(data);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
