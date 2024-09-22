import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { ROLES } from '@/constants/roles';
import { getUserDetails } from '@/services/profileService';
import { fetchProspectByUserId, fetchCompanyWithoutParentByProfileId } from '@/services/companyService';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const AuthListener = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      try {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email);
          const user = session.user;
          setCookie('supabase-token', session.access_token, { maxAge: 43200 }); // 12-hour token expiry

          if (user) {
            const userDetails = await getUserDetails();
            if (userDetails?.role === ROLES.SUPER_ADMIN) {
              router.push('/dashboard');
              return;
            }
            if (userDetails?.role === ROLES.PROSPECT) {
              const prospect = await fetchProspectByUserId(userDetails.id);
              router.push(`/client-portal/infos/${prospect?.id}`);
              return;
            }
            const company = await fetchCompanyWithoutParentByProfileId(user.id);
            if (company) {
              router.push(`/dashboard/folders/${company.id}`);
            }
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setCookie('supabase-token', '', { maxAge: -1 }); // Remove token
          router.push('/');
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup the listener when the component is unmounted
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null; // You can use this component anywhere in your app
};

export default AuthListener;