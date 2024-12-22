import App, { AppContext, AppInitialProps, AppProps } from 'next/app';
import "../app/globals.css";
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/router';
import { UserProvider } from '@/context/userContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthListener from '@/components/auth/AuthListener';
import { fetchCompanyById } from '@/services/companyService';
import { Option, statuses, heatLevels } from '@/constants';
import { getOption } from '@/lib/utils';
import { Company } from '@/types/models';
import ClientPortalLayout from '@/components/clientPortal/ClientPortalLayout';
import { ProspectNavBarActive } from '@/types/types';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [page, setPage] = useState('folders');
  const [statusOption, setStatusOption] = useState<Option>();
  const [heatLevelOption, setHeatLevelOption] = useState<Option>();
  const [prospect, setProspect] = useState<Company>();
  const [loading, setLoading] = useState(true);
  const [prospectNavBarActive, setProspectNavBarActive] = useState<ProspectNavBarActive>('infos');

  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);

  const isDashboard = router.pathname.startsWith('/dashboard');
  const isClientPortal = router.pathname.startsWith('/client-portal') && !router.pathname.startsWith('/client-portal/workflow');
  const isDashboardHome = router.pathname === '/dashboard';

  useEffect(() => {
    if (isClientPortal) {
      const pageType = router.pathname.split('/')[2];
      if (pageType === 'audit' || pageType === 'proposal' || pageType === 'infos') {
        setProspectNavBarActive(pageType);
      }
    }
  }, [router.pathname, isClientPortal]);

  useEffect(() => {
    const fetchData = async () => {
      if (isClientPortal && router.query.id) {
        try {
          const prospectData = await fetchCompanyById(router.query.id as string);
          if (prospectData?.status) {
            setStatusOption(getOption(prospectData.status, statuses));
          }
          if (prospectData?.heat_level) {
            setHeatLevelOption(getOption(prospectData.heat_level, heatLevels));
          }
          if (prospectData) {
            setProspect(prospectData);
          }
        } catch (error) {
          console.error("Error fetching data in _app:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isClientPortal) {
      fetchData();
    }
  }, [isClientPortal, router.query.id]);

  if (loading && isClientPortal) {
    return <div>Loading...</div>; // You can replace this with a better loading state
  }

  return (
    <>
      <AuthListener />
      <UserProvider>
        {isDashboard ? (
          <DashboardLayout currentPage={isDashboardHome ? page : router.pathname.split('/')[2]} setPage={setPage} isDashboardHome={isDashboardHome}>
            <Component {...pageProps} page={page} />
          </DashboardLayout>
        ) : isClientPortal ? (
          <ClientPortalLayout statusOption={statusOption} heatLevelOption={heatLevelOption} prospect={prospect} prospectNavBarActive={prospectNavBarActive}>
            <Component {...pageProps} />
          </ClientPortalLayout>
        ) : (
          <Component {...pageProps} />
        )}
        <ToastContainer />
      </UserProvider>
    </>
  );
}

MyApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps> => {
  const ctx = await App.getInitialProps(context);
  return ctx;
};
