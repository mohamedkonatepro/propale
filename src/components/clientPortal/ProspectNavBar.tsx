import React from 'react';
import Link from 'next/link';
import { ProspectNavBarActive } from '@/types/types';

interface NavItemProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, isActive, children }) => (
  <Link 
    href={href}
    className={`text-sm flex items-center justify-center py-2 px-16 rounded-full text-center ${
      isActive ? 'text-white bg-black' : 'text-black'
    }`}
    rel="noopener noreferrer"
  >
    {children}
  </Link>
);

interface ProspectNavBarProps {
  active: ProspectNavBarActive;
  prospectId: string;
}

const ProspectNavBar: React.FC<ProspectNavBarProps> = ({ active, prospectId }) => {
  return (
    <div className="bg-white p-2 rounded-full flex flex-wrap justify-around items-center w-full md:w-3/5 lg:w-2/5 mx-auto space-y-2 md:space-y-0">
      <NavItem href={`/client-portal/infos/${prospectId}`} isActive={active === 'infos'}>
        Infos
      </NavItem>
      <NavItem href={`/client-portal/audit/${prospectId}`} isActive={active === 'audit'}>
        Audit
      </NavItem>
      {/* <NavItem href={`/client-portal/canvas/${prospectId}`} isActive={active === 'canvas'}>
        Canevas
      </NavItem> */}
      <NavItem href={`/client-portal/proposal/${prospectId}/list`} isActive={active === 'proposal'}>
        Proposition
      </NavItem>
    </div>
  );
};

export default ProspectNavBar;