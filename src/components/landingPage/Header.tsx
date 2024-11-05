import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';
import handleSessionAndRedirect from '@/services/authService';
import Image from 'next/image';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleDashboardRedirect = async () => {
    if (user) {
      const { data } = await supabase.auth.getSession();
      await handleSessionAndRedirect(user, data.session, router);
    }
  };

  return (
    <header className="fixed w-full bg-white shadow-lg z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom de l'entreprise */}
          <div className="flex items-center">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <span className="ml-3 text-xl font-bold text-gray-800">Propale</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#features" className="text-blueCustom hover:text-blue-700">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-blueCustom hover:text-blue-700">
              Tarifs
            </a>
            <a href="#contact" className="text-blueCustom hover:text-blue-700">
              Contact
            </a>

            {/* Logique de connexion/déconnexion */}
            {!user ? (
              <a
                onClick={() => router.push('/auth/login')}
                className="px-4 py-3 bg-white text-blueCustom rounded-md text-sm font-medium hover:bg-blue-100 border border-blueCustom cursor-pointer"
              >
                Connexion
              </a>
            ) : (
              <div>
                <a
                  onClick={handleLogout}
                  className="px-4 py-3 bg-white text-red-600 rounded-md text-sm font-medium hover:bg-red-200 cursor-pointer border border-red-600"
                >
                  Déconnexion
                </a>
                <a
                  onClick={handleDashboardRedirect}
                  className="px-4 py-3 ml-5 bg-blueCustom text-white rounded-md text-sm font-medium hover:bg-blue-700 border border-blueCustom cursor-pointer"
                >
                  Tableau de bord
                </a>
              </div>

            )}
              <a
                href="#contact"
                className="px-4 py-3 bg-blueCustom text-white rounded-md text-sm font-medium hover:bg-blue-700 border border-blueCustom"
              >
                Demander une démo
              </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
