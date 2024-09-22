import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);

  const { profileId } = req.query;
  const search = req.query.search as string || '';

  if (req.method === 'GET') {
    const { data: companyProfileData, error: companyProfileError } = await supabase
      .from('companies_profiles')
      .select('company_id')
      .eq('profile_id', profileId);

    if (companyProfileError || !companyProfileData || companyProfileData.length === 0) {
      return res.status(404).json({ error: 'No companies found for this profile.' });
    }

    let companyIds = companyProfileData.map(({ company_id }) => company_id);
    let query = supabase
      .from('company')
      .select('*')
      .in('id', companyIds)
      .not('company_id', 'is', null)
      .neq('company_id', '')
      .is('type', null);

    if (search && search.length >= 3) {
      query = query.or(`name.ilike.%${search}%,siret.ilike.%${search}%`);
    }

    const { data: companiesData, error: companiesError } = await query;

    if (companiesError) {
      return res.status(500).json({ error: 'Error fetching company details.' });
    }

    return res.status(200).json(companiesData);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
