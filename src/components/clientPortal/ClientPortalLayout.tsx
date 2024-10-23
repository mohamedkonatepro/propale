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
import { HiMiniArrowLeftStartOnRectangle } from 'react-icons/hi2';

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
          <Link className="text-blueCustom hover:text-blue-800 transition-colors" href={`/dashboard/prospect/${prospect?.company_id}`}>
            Retour
          </Link>
        ) : (
          <div className='flex ml-3 cursor-pointer' onClick={handleLogout}>
            <div className='flex mr-2'> 
              <HiMiniArrowLeftStartOnRectangle className='text-red-500' size={25}/>
            </div>
            <div className='flex'>
              <label className="block text-red-500 cursor-pointer">
                Se déconnecter
              </label>
            </div>
          </div>
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
