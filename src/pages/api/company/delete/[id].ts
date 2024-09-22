import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('company')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error deleting company' });
    }

    return res.status(200).json({ message: 'Company deleted successfully' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
