import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Propale</h1>
        {!user ? (
          <>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full mb-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blueCustom hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blueCustom"
            >
              Login
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
