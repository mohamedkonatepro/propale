import { setCookie } from 'cookies-next';
import { ROLES } from '@/constants/roles';
import { getUserDetails } from '@/services/profileService';
import { fetchCompanyWithoutParentByProfileId, fetchProspectByUserId } from '@/services/companyService';
import { Session, User } from '@supabase/supabase-js';
import { NextRouter } from 'next/router';

async function handleSessionAndRedirect(user: User | null, session: Session | null, router: NextRouter) {
  if (session) {
    setCookie('supabase-token', session.access_token);
    if (user) {
      const userDetails = await getUserDetails();
      if (userDetails?.blocked) {
        router.push('/restricted');
        return;
      }
      if (userDetails?.role === ROLES.SUPER_ADMIN) {
        router.push('/dashboard');
        return;
      }

      if (userDetails?.role === ROLES.PROSPECT) {
        const prospect = await fetchProspectByUserId(userDetails.id);
        router.push(`/client-portal/infos/${prospect?.id}`);
        return;
      }

      const company = await fetchCompanyWithoutParentByProfileId(user?.id);
      if (company) {
        router.push(`/dashboard/folders/${company.id}`);
      }
    }
  }
}

export default handleSessionAndRedirect;
