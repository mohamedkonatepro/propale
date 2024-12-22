import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
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
import ActionModal from '../modals/ActionModal';
import useModalState from '@/hooks/useModalState';
import StepperStatus from './StepperStatus';

type ClientPortalLayoutProps = {
  statusOption?: Option;
  heatLevelOption?: Option;
  prospect?: Company;
  children: React.ReactNode;
  prospectNavBarActive: ProspectNavBarActive;
};

const redirectToListIfNeeded = (router: any, prospect: Company) => {
  const currentPath = router.asPath;
  const basePath = `/client-portal/proposal/${prospect.id}`;
  const queryProposalId = router.query.proposalId;

  if (currentPath === basePath || (queryProposalId && currentPath.startsWith(basePath))) {
    return `${basePath}/list`;
  }
  return `/dashboard/prospect/${prospect?.company_id}`;
};

const ClientPortalLayout: React.FC<ClientPortalLayoutProps> = ({ statusOption, heatLevelOption, prospect, children, prospectNavBarActive }) => {
  const { user } = useUser();
  const router = useRouter();
  const logoutModalState = useModalState();

  const steps = useMemo(() => {
    const baseSteps = [
      { label: "Nouveau", value: 'new', completed: false, active: false },
      { label: "Audit", value: 'audit', completed: false, active: false },
      { label: "Proposition", value: 'proposal', completed: false, active: false },
      { label: "Conclu", value: 'concluded', completed: false, active: false },
    ];

    let activeFound = false;
    return baseSteps.map((step) => {
      if (step.value === statusOption?.value) {
        activeFound = true;
        return { ...step, active: true, completed: false };
      }
      return {
        ...step,
        completed: !activeFound,
        active: false,
      };
    });
  }, [statusOption?.value]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logoutModalState.closeModal();
  };

  if (!prospect) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="flex px-8 py-5 bg-white justify-between items-center shadow-md">

        <Header
          title={prospect?.name}
          badge={heatLevelOption}
          siren={prospect?.siren}
        />

        <div className={`hidden ${user?.role === ROLES.PROSPECT ? 'lg-only:flex' : 'lg:flex'} justify-center items-center`}>
          <StepperStatus steps={steps} />
        </div>

        {user?.role !== ROLES.PROSPECT ? (
          <Link
            className="text-blueCustom hover:text-blue-800 transition-colors mb-20"
            href={redirectToListIfNeeded(router, prospect)}
          >
            Retour
          </Link>
        ) : (
          <div className='flex ml-3 cursor-pointer mb-20' onClick={logoutModalState.openModal}>
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

      <main className="flex-grow p-8 mx-2 xl:mx-16 mt-4 bg-backgroundGray rounded-2xl">
        {children}
      </main>

      <ActionModal
        isOpen={logoutModalState.isModalOpen}
        onClose={logoutModalState.closeModal}
        onConfirm={handleLogout}
        title="Confirmer la déconnexion ?"
        message="Vous allez être déconnecté de cet appareil."
        cancelButtonText="Annuler"
        confirmButtonText="Se déconnecter"
        icon="/uil-sign-out-alt.svg"
      />
    </div>
  );
};

export default ClientPortalLayout;
