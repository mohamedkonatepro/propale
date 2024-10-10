import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from 'cookies-next';
import { getUserDetails } from './services/profileService';
import { fetchCompanyWithoutParentByProfileId, fetchProspectByUserId } from './services/companyService';
import { fetchCompanySettings } from './services/companySettingsService';
import { ROLES } from './constants/roles';
import { supabase } from './lib/supabaseClient';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const token = getCookie('supabase-token', { req, res });

  if (!token) {
    await supabase.auth.signOut();
  }

  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/client-portal')) {
    const user = await getUserDetails(token);
    if (!user) {
      await supabase.auth.signOut();
    }
    if (user) {
      if (user?.blocked) {
        console.log('User is blocked');
        return NextResponse.redirect(new URL(`/restricted`, req.url));
      }

      // Check if the company is disabled
      const company = await fetchCompanyWithoutParentByProfileId(user.id);
      if (company) {
        const companySettings = await fetchCompanySettings(company.id);
        if (companySettings?.is_account_disabled && user.role !== ROLES.SUPER_ADMIN) {
          console.log('Company account is disabled');
          return NextResponse.redirect(new URL(`/restricted`, req.url));
        }
      }

      if (user.role === ROLES.PROSPECT && req.nextUrl.pathname.startsWith('/dashboard')) {
        const prospect = await fetchProspectByUserId(user.id);
        if (prospect) {
          return NextResponse.redirect(new URL(`/client-portal/infos/${prospect.id}`, req.url)); // Redirect to client-portal
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};