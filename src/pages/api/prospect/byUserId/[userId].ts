import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { ROLES } from '@/constants/roles';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      // Step 1: Find the company associated with the profile
      const { data: companyProfile, error: companyProfileError } = await supabase
        .from('companies_profiles')
        .select('company_id')
        .eq('profile_id', userId)
        .single();

      if (companyProfileError || !companyProfile) {
        return res.status(404).json({ error: 'No company associated with this profile' });
      }

      // Step 2: Retrieve Company Details
      const { data: company, error: companyError } = await supabase
        .from('company')
        .select('*')
        .eq('id', companyProfile.company_id)
        .eq('type', ROLES.PROSPECT)
        .single();

      if (companyError || !company) {
        return res.status(404).json({ error: 'No prospect company found for this user' });
      }

      return res.status(200).json(company);
    } catch (error) {
      console.error('Unexpected error while fetching prospect:', error);
      return res.status(500).json({ error: 'Error fetching prospect' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
