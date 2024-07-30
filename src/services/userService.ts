import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { AuthApiError, AuthUser } from '@supabase/supabase-js';
import { ROLES } from '@/constants/roles';
import { Profile } from '@/types/models';

export const createUser = async (email: string, password?: string): Promise<AuthUser | string | null> => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'New User' }
  });

  if (error) {
    if (error instanceof AuthApiError && error.status >= 400 && error.message.includes('already been registered')) {
      return 'email_already_exists';
    }
    return null;
  }
  return data?.user;
};

export const fetchProfilesWithRoleSuperAdmin = async (search?: string): Promise<Profile[] | null> => {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', ROLES.SUPER_ADMIN);

  if (search) {
    query = query.or(`firstname.ilike.%${search}%,lastname.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return null;
  }

  return data as Profile[];
};

export const fetchProfilesCountWithRoleSuperAdmin = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role', ROLES.SUPER_ADMIN);

  if (error) {
    console.error('Error fetching profile count:', error);
    return 0;
  }

  return count ?? 0;
};

export const fetchProfileById = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data as Profile;
};

export const sendPasswordResetEmail = async (email: string) => {
  const result = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`,
  });

  return result;
};
