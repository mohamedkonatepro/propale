import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { companyId } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('default_descriptions')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: 'Error fetching default description' });
    }

    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { description, name } = req.body;
    const { error } = await supabase
      .from('default_descriptions')
      .upsert([{
        company_id: companyId,
        description,
        name,
        updated_at: new Date().toISOString(),
      }], { onConflict: 'company_id' })

    if (error) {
      return res.status(500).json({ error: 'Error saving default description' });
    }

    return res.status(200).json({ message: 'Default description saved' });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('default_descriptions')
      .delete()
      .eq('company_id', companyId);

    if (error) {
      return res.status(500).json({ error: 'Error deleting default description' });
    }

    return res.status(200).json({ message: 'Default description deleted' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
