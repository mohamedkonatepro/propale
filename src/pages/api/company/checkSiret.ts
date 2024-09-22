import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { companyId, siret } = req.query;

  if (req.method === 'GET') {
    const { data: companyData, error } = await supabase
      .from('company')
      .select('*')
      .eq('siret', siret);

    if (error) {
      return res.status(500).json({ error: 'Error checking SIRET' });
    }

    if (companyData && companyData.length > 0) {
      const isSameCompanyId = companyData.some((company) => company.company_id === companyId);

      if (isSameCompanyId) {
        return res.status(409).json({ message: 'Company with the same SIRET and company_id already exists' });
      } else {
        return res.status(200).json({ message: 'Company with different company_id exists for the same SIRET' });
      }
    }

    return res.status(200).json({ message: 'SIRET is valid and not used by another company' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
