import React from 'react';
import ProspectNavBar from '@/components/clientPortal/ProspectNavBar';
import { supabase } from '@/lib/supabaseClient';
import { ROLES } from '@/constants/roles';
import Link from 'next/link';
import Header from '../layout/Header';
import { Company } from '@/types/models';
import { useUser } from '@/context/userContext';
import { Option } from '@/constants';
import { ProspectNavBarActive } from '@/types/types';

type ClientPortalLayoutProps = {
  statusOption?: Option;
  prospect?: Company;
  children: React.ReactNode;
  prospectNavBarActive: ProspectNavBarActive;
};

const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({ statusOption, prospect, children, prospectNavBarActive }) => {
  const { user } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="flex px-8 py-5 bg-white justify-between items-center shadow-md">
        {statusOption && <Header title={prospect?.name} badgeName={statusOption.label} badgeColor={statusOption.color} siren={prospect?.siren} />}
        {user?.role !== ROLES.PROSPECT ? (
          <Link className="text-blue-600 hover:text-blue-800 transition-colors" href={`/dashboard/prospect/${prospect?.company_id}`}>
            Retour
          </Link>
        ) : (
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">
            Se déconnecter
          </button>
        )}
      </header>
      <div className="flex justify-center mt-6">
        {prospect && <ProspectNavBar active={prospectNavBarActive} prospectId={prospect?.id} />}
      </div>
      <main className="flex-grow p-8 mx-16 mt-4 bg-backgroundGray rounded-2xl">
        {children}
      </main>
    </div>
  );
};

export default ClientPortalLayout;
