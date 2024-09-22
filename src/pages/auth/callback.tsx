import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { fetchCompanyWithoutParentByProfileId } from '@/services/companyService';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return;
      }

      if (session) {
        const { user } = session;
        if (!user.app_metadata.providers.includes('email')) {
          await supabase.auth.signOut();
          await supabaseAdmin.auth.admin.deleteUser(user.id);
        }
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-xl font-bold mb-6">Redirection en cours...</h3>
      </div>
    </div>
  );
};

export default Callback;
