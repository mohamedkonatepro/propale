import { supabase } from '@/lib/supabaseClient';

export const associateProfileWithCompany = async (userId: string, companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('companies_profiles')
    .insert([{
      profile_id: userId,
      company_id: companyId,
    }])
    .single();

  if (error) {
    console.error('Error associating profile with company:', error);
    throw error;
  }
};
