import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';
import handleSessionAndRedirect from '@/services/authService';
import Image from 'next/image';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // Change state when scrolling 10px
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false); // Close menu after logout
  };

  const handleDashboardRedirect = async () => {
    if (user) {
      const { data } = await supabase.auth.getSession();
      await handleSessionAndRedirect(user, data.session, router);
      setIsMenuOpen(false); // Close menu after navigation
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-white/0' : 'backdrop-blur-none bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-20">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom de l'entreprise */}
          <div className="flex items-center">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <span className="ml-3 text-xl font-medium text-gray-800">Propale</span>
          </div>

          {/* Menu Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Navigation (Desktop) */}
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

      {/* Navigation (Mobile Menu) */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md z-40">
          <div className="flex flex-col space-y-4 p-4">
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="text-blueCustom hover:text-blue-700"
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMenuOpen(false)}
              className="text-blueCustom hover:text-blue-700"
            >
              Tarifs
            </a>
            <a
              href="#contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-blueCustom hover:text-blue-700"
            >
              Contact
            </a>

            {!user ? (
              <a
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/auth/login');
                }}
                className="px-4 py-3 bg-white text-blueCustom rounded-md text-sm font-medium hover:bg-blue-100 border border-blueCustom cursor-pointer"
              >
                Connexion
              </a>
            ) : (
              <>
                <a
                  onClick={handleLogout}
                  className="px-4 py-3 bg-white text-red-600 rounded-md text-sm font-medium hover:bg-red-200 cursor-pointer border border-red-600"
                >
                  Déconnexion
                </a>
                <a
                  onClick={handleDashboardRedirect}
                  className="px-4 py-3 bg-blueCustom text-white rounded-md text-sm font-medium hover:bg-blue-700 border border-blueCustom cursor-pointer"
                >
                  Tableau de bord
                </a>
              </>
            )}

            <a
              href="#contact"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 bg-blueCustom text-white rounded-md text-sm font-medium hover:bg-blue-700 border border-blueCustom"
            >
              Demander une démo
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
