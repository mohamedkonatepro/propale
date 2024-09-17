import React from 'react';
import Link from 'next/link';

interface NavItemProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, isActive, children }) => (
  <Link 
    href={href}
    className={`text-sm flex items-center justify-center py-2 px-2 rounded-full text-center ${
      isActive ? 'text-white bg-black px-16 rounded-full' : 'text-black'
    }`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </Link>
);

interface ProspectNavBarProps {
  active: 'infos' | 'audit' | 'proposal';
  prospectId: string;
}

const ProspectNavBar: React.FC<ProspectNavBarProps> = ({ active, prospectId }) => {
  return (
    <div className="bg-white p-2 rounded-full w-1/2 flex justify-around items-center">
      <NavItem href={`/client-portal/infos/${prospectId}`} isActive={active === 'infos'}>
        Infos
      </NavItem>
      <NavItem href={`/client-portal/audit/${prospectId}`} isActive={active === 'audit'}>
        Audit
      </NavItem>
      <NavItem href={`/client-portal/proposal/${prospectId}`} isActive={active === 'proposal'}>
        Proposition
      </NavItem>
    </div>
  );
};

export default ProspectNavBar;