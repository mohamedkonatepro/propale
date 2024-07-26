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

export const removeProfileFromCompany = async (userId: string, companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('companies_profiles')
    .delete()
    .eq('profile_id', userId)
    .eq('company_id', companyId);

  if (error) {
    console.error('Error removing profile from company:', error);
    throw error;
  }
};

export const fetchUserAccess = async (profileId: string): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from('companies_profiles')
    .select('company_id')
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error fetching user access:', error);
    return new Set();
  }

  return new Set(data.map((item: { company_id: string }) => item.company_id));
};
