import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  
  const { profileId } = req.query;

  if (req.method === 'GET') {
    // Fetch companies associated with the profile
    const { data: companies, error } = await supabase
      .from('companies_profiles')
      .select('company_id')
      .eq('profile_id', profileId);

    if (error || !companies || companies.length === 0) {
      return res.status(404).json({ error: 'No companies found for this profile.' });
    }

    // Loop through companies to find the one without a parent company_id
    for (let { company_id } of companies) {
      // Fetch company details
      const { data: company, error: companyError } = await supabase
        .from('company')
        .select('*')
        .eq('id', company_id)
        .single();

      if (companyError || !company) continue;

      // Check if the company has a parent company
      let topCompany = company;
      while (topCompany.company_id) {
        // Fetch parent company
        const { data: parentCompany, error: parentCompanyError } = await supabase
          .from('company')
          .select('*')
          .eq('id', topCompany.company_id)
          .single();

        if (parentCompanyError || !parentCompany) break;

        topCompany = parentCompany;
      }

      // Return the top-most company without a parent company_id
      if (!topCompany.company_id) {
        return res.status(200).json(topCompany);
      }
    }

    // If no top-most parent company is found
    return res.status(404).json({ error: 'No company without a parent company_id found.' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
