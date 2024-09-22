// src/pages/_app.tsx
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
export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [page, setPage] = useState('folders');

  useEffect(() => {
    Modal.setAppElement('#__next'); // Set the app element to the root div in Next.js
  }, []);


  const isDashboard = router.pathname.startsWith('/dashboard');
  const isDashboardHome = router.pathname === '/dashboard';

  return (
    <>
      <AuthListener />
      <UserProvider>
        {isDashboard ? (
          <DashboardLayout currentPage={isDashboardHome ? page : router.pathname.split('/')[2]} setPage={setPage} isDashboardHome={isDashboardHome}>
            <Component {...pageProps} page={page} />
          </DashboardLayout>
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
