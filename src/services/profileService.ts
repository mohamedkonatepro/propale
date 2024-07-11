import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/models';

export const getUserDetails = async (): Promise<Profile | null> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  if (error) {
    return null;
  }

  return data as Profile;
};

export const createProfile = async (userId: string, dataModal: any): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .insert([{
      id: userId,
      firstname: dataModal.firstname,
      lastname: dataModal.lastname,
      position: dataModal.position,
      phone: dataModal.phone,
      email: dataModal.email,
      role: 'admin',
      blocked: false,
    }])
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const fetchProfilesWithUserDetails = async (companyId: string): Promise<Profile[]> => {
  const { data: companyProfiles, error: companyProfilesError } = await supabase
    .from('companies_profiles')
    .select('profile_id')
    .eq('company_id', companyId);

  if (companyProfilesError) {
    console.error('Error fetching profiles with user details:', companyProfilesError);
    return [];
  }

  const profileDetailsPromises = companyProfiles.map(async ({ profile_id }) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile_id)
      .single();

    if (profileError) {
      console.error(`Error fetching details for profile ID ${profile_id}:`, profileError);
      return null;
    }

    return profileData;
  });

  const profileDetails = await Promise.all(profileDetailsPromises);

  return profileDetails.filter(profile => profile !== null) as Profile[];
};

export const fetchProfileCountByCompanyId = async (companyId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('companies_profiles')
    .select('profile_id', { count: 'exact' })
    .eq('company_id', companyId);

  if (error) {
    console.error('Error fetching profile count:', error);
    return 0;
  }

  return count ?? 0;
};
