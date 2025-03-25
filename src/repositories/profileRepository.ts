import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/models';

export class ProfileRepository {
  
  static async findById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching profile: ${error.message}`);
    }

    return data;
  }

  static async findByCompanyId(companyId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('companies_profiles')
      .select('profile_id')
      .eq('company_id', companyId);

    if (error) {
      throw new Error(`Error fetching company-profile relations: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const profileIds = data.map(item => item.profile_id);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', profileIds);

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    return profiles || [];
  }

  static async create(profileData: {
    userId: string;
    firstname: string;
    lastname: string;
    position: string;
    phone: string;
    email: string;
    role: string;
    is_primary_contact: boolean;
  }): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: profileData.userId,
        firstname: profileData.firstname,
        lastname: profileData.lastname,
        position: profileData.position,
        phone: profileData.phone,
        email: profileData.email,
        role: profileData.role,
        is_primary_contact: profileData.is_primary_contact,
        blocked: false,
      }])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating profile: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, profileData: Partial<Profile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        firstname: profileData.firstname,
        lastname: profileData.lastname,
        position: profileData.position,
        phone: profileData.phone,
        email: profileData.email,
        role: profileData.role,
        blocked: profileData.blocked,
        is_primary_contact: profileData.is_primary_contact,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting profile: ${error.message}`);
    }
  }

  static async associateWithCompany(profileId: string, companyId: string): Promise<void> {
    const { error } = await supabase
      .from('companies_profiles')
      .insert([{
        profile_id: profileId,
        company_id: companyId,
      }]);

    if (error) {
      throw new Error(`Error associating profile with company: ${error.message}`);
    }
  }

  static async dissociateFromCompany(profileId: string, companyId: string): Promise<void> {
    const { error } = await supabase
      .from('companies_profiles')
      .delete()
      .eq('profile_id', profileId)
      .eq('company_id', companyId);

    if (error) {
      throw new Error(`Error dissociating profile from company: ${error.message}`);
    }
  }

  static async findCompanyIdsByProfileId(profileId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('companies_profiles')
      .select('company_id')
      .eq('profile_id', profileId);

    if (error) {
      throw new Error(`Error fetching company IDs: ${error.message}`);
    }

    return data?.map(item => item.company_id) || [];
  }

  // Méthode optimisée pour éviter le problème N+1
  static async findWithCountsByCompanyId(companyId: string, search?: string): Promise<Array<Profile & {folder_count: number}>> {
    // 1. Récupérer tous les profils avec leurs détails utilisateur
    const { data: companyProfiles, error: companyProfilesError } = await supabase
      .from('companies_profiles')
      .select('profile_id')
      .eq('company_id', companyId);

    if (companyProfilesError) {
      throw new Error(`Error fetching company profiles: ${companyProfilesError.message}`);
    }

    if (!companyProfiles || companyProfiles.length === 0) {
      return [];
    }

    const profileIds = companyProfiles.map(cp => cp.profile_id);

    // 2. Récupérer tous les profils en une requête
    let profilesQuery = supabase
      .from('profiles')
      .select('*')
      .in('id', profileIds);

    if (search && search.length >= 3) {
      profilesQuery = profilesQuery.or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    // 3. Récupérer tous les comptes en une seule requête avec IN  
    const { data: countData, error: countError } = await supabase
      .from('companies_profiles')
      .select('profile_id')
      .in('profile_id', profileIds);

    if (countError) {
      throw new Error(`Error fetching profile counts: ${countError.message}`);
    }

    // 4. Créer un map des comptes par profile_id
    const countMap: { [profileId: string]: number } = {};
    countData?.forEach(item => {
      countMap[item.profile_id] = (countMap[item.profile_id] || 0) + 1;
    });

    // 5. Combiner les données
    return profiles.map((profile: Profile) => ({
      ...profile,
      folder_count: Math.max(0, (countMap[profile.id] || 1) - 1)
    }));
  }
}