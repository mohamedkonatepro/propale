import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import corsMiddleware, { cors } from '@/lib/corsMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('companies_profiles')
        .select('profile_id')
        .eq('company_id', id);

      if (profileError || !profileData) {
        throw new Error('Error fetching profile data');
      }

      const { error: stepperSessionError } = await supabase
        .from('stepper_sessions')
        .delete()
        .eq('prospect_id', id);

      const { error: proposalError } = await supabase
        .from('proposals')
        .delete()
        .eq('prospect_id', id);

      if (stepperSessionError || proposalError) {
        throw new Error('Error deleting related data');
      }

      for (const profile of profileData) {
        const result = await supabaseAdmin.auth.admin.deleteUser(profile.profile_id);
        if (result.error) {
          throw new Error(`Error deleting user with profile id ${profile.profile_id}`);
        }
      }

      const { error: companyError } = await supabase
        .from('company')
        .delete()
        .eq('id', id);

      if (companyError) {
        throw new Error('Error deleting prospect');
      }

      return res.status(200).json({ message: 'Prospect, related data, and users deleted successfully' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
