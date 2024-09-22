import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { companyId } = req.query;

  if (req.method === 'GET') {
    // Step 1: Get all child companies
    const { data: childCompanies, error: childError } = await supabase
      .from('company')
      .select('id')
      .eq('company_id', companyId);

    if (childError) {
      return res.status(500).json({ error: 'Error fetching child companies' });
    }

    // Include the parent company ID in the list
    const allCompanyIds = [companyId, ...childCompanies.map(c => c.id)];

    // Step 2: Count all prospects for these companies
    const { count, error } = await supabase
      .from('company')
      .select('id', { count: 'exact' })
      .in('company_id', allCompanyIds)
      .eq('type', 'prospect');

    if (error) {
      return res.status(500).json({ error: 'Error counting prospects' });
    }

    return res.status(200).json({ count: count ?? 0 });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
