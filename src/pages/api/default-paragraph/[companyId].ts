import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { companyId } = req.query;
  const paragraphId = req.query.paragraphId as string;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('default_paragraphs')
      .select('*')
      .eq('company_id', companyId);

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: 'Error fetching default paragraph' });
    }

    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    const { error } = await supabase
      .from('default_paragraphs')
      .upsert([{
        company_id: companyId,
        name,
        description,
        updated_at: new Date().toISOString(),
      }]);

    if (error) {
      return res.status(500).json({ error: 'Error saving default paragraph' });
    }

    return res.status(200).json({ message: 'Default paragraph saved' });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('default_paragraphs')
      .delete()
      .eq('id', paragraphId)
      .eq('company_id', companyId);

    if (error) {
      return res.status(500).json({ error: 'Error deleting default paragraph' });
    }

    return res.status(200).json({ message: 'Default paragraph deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
