import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/models';
import { createUser, sendPasswordResetEmail } from './userService';
import { 
  validateCreateProfileData, 
  validateUpdateProfileData,
  CreateProfileInput,
  UpdateProfileInput 
} from '@/validation/profileValidation';

export const getUserDetails = async (token?: string): Promise<Profile | null> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

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

export const createProfile = async (dataModal: unknown): Promise<void> => {
  const validatedData = validateCreateProfileData(dataModal);
  
  const { error } = await supabase
    .from('profiles')
    .insert([{
      id: validatedData.userId,
      firstname: validatedData.firstname,
      lastname: validatedData.lastname,
      position: validatedData.position,
      phone: validatedData.phone,
      email: validatedData.email,
      role: validatedData.role,
      blocked: false,
      is_primary_contact: validatedData.is_primary_contact,
    }])
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }
};

export const fetchProfilesWithCountsOptimized = async (companyId: string, search?: string): Promise<Array<Profile & {folder_count: number}>> => {
  const { ProfileRepository } = await import('@/repositories/profileRepository');
  return await ProfileRepository.findWithCountsByCompanyId(companyId, search);
};

export const fetchProfilesWithUserDetails = async (companyId: string, search?: string): Promise<Profile[]> => {
  const { data: companyProfiles, error: companyProfilesError } = await supabase
    .from('companies_profiles')
    .select('profile_id')
    .eq('company_id', companyId);

  if (companyProfilesError) {
    console.error('Error fetching profiles with user details:', companyProfilesError);
    return [];
  }

  let query = supabase
    .from('profiles')
    .select('*')
    .in('id', companyProfiles.map(cp => cp.profile_id)); // Use 'in' to filter profiles by their IDs

  if (search && search.length >= 3) {
    const searchLower = search.toLowerCase();
    query = query.or(`firstname.ilike.%${searchLower}%,lastname.ilike.%${searchLower}%`);
  }

  const { data: profileDetails, error: profileError } = await query;

  if (profileError) {
    console.error('Error fetching profile details:', profileError);
    return [];
  }

  return profileDetails;
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

export const fetchProfileCountByProfileId = async (profileId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('companies_profiles')
    .select('company_id', { count: 'exact' })
    .eq('profile_id', profileId);

  if (error) {
    console.error('Error fetching profile count:', error);
    return 0;
  }

  return count ?? 0;
};

export const updateUserProfile = async (data: Profile, userUpdatedId?: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      firstname: data.firstname,
      lastname: data.lastname,
      position: data.position,
      phone: data.phone,
      role: data.role,
      blocked: data.blocked,
      is_primary_contact: data.is_primary_contact || false,
      updated_by: userUpdatedId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

export const fetchPrimaryContactByCompanyId = async (companyId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('companies_profiles')
    .select('profile_id')
    .eq('company_id', companyId)
    .then(async (companyProfileData) => {
      if (companyProfileData.error || !companyProfileData.data) {
        return { data: null, error: companyProfileData.error };
      }
      
      const profileIds = companyProfileData.data.map(cp => cp.profile_id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds)
        .eq('is_primary_contact', true)
        .single();

      return { data, error };
    });

  if (error) {
    return null;
  }

  return data;
};

export const fetchContactByCompanyId = async (companyId: string, withPrimaryContact: boolean = false): Promise<Profile[] | null> => {
  try {
    const { data: companyProfileData, error: companyProfileError } = await supabase
      .from('companies_profiles')
      .select('profile_id')
      .eq('company_id', companyId);

    if (companyProfileError || !companyProfileData) {
      console.error('Error fetching company profiles:', companyProfileError);
      return null;
    }

    const profileIds = companyProfileData.map(cp => cp.profile_id);

    let query = supabase
      .from('profiles')
      .select('*')
      .in('id', profileIds);

    if (!withPrimaryContact) {
      query = query.eq('is_primary_contact', false);
    }

    const { data: profilesData, error: profilesError } = await query;

    if (profilesError || !profilesData) {
      console.error('Error fetching profiles:', profilesError);
      return null;
    }

    return profilesData;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

export const createContact = async (contact: Profile, companyId: string): Promise<void> => {
  if (contact.is_primary_contact) {
    await ensureSinglePrimaryContact(companyId);
  }

  const user = await createUser(contact.email);
  if (!user) throw new Error('Failed to create primary contact user');
  
  await sendPasswordResetEmail(contact.email);
  // Create the profile
  await createProfile({...contact, userId: user.id });

  // Associate the profile with the company
  const { error: associationError } = await supabase
    .from('companies_profiles')
    .insert([{ company_id: companyId, profile_id: user.id }])
    .single();

  if (associationError) {
    throw associationError;
  }
};

export const updateContact = async (contact: Profile, companyId: string): Promise<void> => {
  if (contact.is_primary_contact) {
    await ensureSinglePrimaryContact(companyId);
  }

  await updateUserProfile(contact)
};

const ensureSinglePrimaryContact = async (companyId: string) => {
  const { data, error } = await supabase
    .from('companies_profiles')
    .select('profile_id')
    .eq('company_id', companyId);

  if (error) {
    console.error('Error fetching profiles for company:', error);
    throw error;
  }

  const profileIds = data.map(cp => cp.profile_id);
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_primary_contact: false })
    .in('id', profileIds)
    .eq('is_primary_contact', true);

  if (updateError) {
    console.error('Error updating profiles:', updateError);
    throw updateError;
  }
};

export const countProfilesByCompanyId = async (companyId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('companies_profiles')
    .select('profile_id', { count: 'exact' })
    .eq('company_id', companyId);

  if (error) {
    console.error('Error counting profiles:', error);
    return 0;
  }

  return count ?? 0;
};