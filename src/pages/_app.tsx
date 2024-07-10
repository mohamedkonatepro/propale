import App, { AppContext, AppInitialProps, AppProps } from 'next/app'
import "../app/globals.css";
import { useEffect, useState } from 'react';
import { getUserDetails } from '@/services/userService';
import { Profile } from '@/types/models';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/router';

export default function MyApp({
  Component,
  pageProps,
}: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [page, setPage] = useState('folders');

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserDetails();
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  const isDashboard = router.pathname.startsWith('/dashboard');
  const isDashboardHome = router.pathname === '/dashboard';
  return isDashboard ? (
    <DashboardLayout user={user} currentPage={isDashboardHome ? page : router.pathname.split('/')[2]} setPage={setPage} isDashboardHome={isDashboardHome}>
      <Component {...pageProps} user={user} page={page} />
    </DashboardLayout>
  ) : (
    <Component {...pageProps} user={user} />
  );
}
 
MyApp.getInitialProps = async (
  context: AppContext
): Promise<AppInitialProps> => {
  const ctx = await App.getInitialProps(context)

  return ctx
}
