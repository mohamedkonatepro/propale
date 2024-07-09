import App, { AppContext, AppInitialProps, AppProps } from 'next/app'
import "../app/globals.css";
import { useEffect, useState } from 'react';
import { getUserDetails } from '@/services/userService';
import { Profile } from '@/types/models';

export default function MyApp({
  Component,
  pageProps,
}: AppProps) {
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserDetails();
      setUser(user);
    };
    getUser();
  }, []);
  return (
    <Component {...pageProps} user={user} />
  )
}
 
MyApp.getInitialProps = async (
  context: AppContext
): Promise<AppInitialProps> => {
  const ctx = await App.getInitialProps(context)

  return ctx
}
