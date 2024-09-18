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
    className={`text-sm flex items-center justify-center py-2 px-16 rounded-full text-center ${
      isActive ? 'text-white bg-black' : 'text-black'
    }`}
    rel="noopener noreferrer"
  >
    {children}
  </Link>
);

interface ProspectNavBarProps {
  active: 'infos' | 'audit' | 'proposal' | 'canvas';
  prospectId: string;
}

const ProspectNavBar: React.FC<ProspectNavBarProps> = ({ active, prospectId }) => {
  return (
    <div className="bg-white p-2 rounded-full w-2/5 flex justify-around items-center">
      <NavItem href={`/client-portal/infos/${prospectId}`} isActive={active === 'infos'}>
        Infos
      </NavItem>
      <NavItem href={`/client-portal/audit/${prospectId}`} isActive={active === 'audit'}>
        Audit
      </NavItem>
      {/* <NavItem href={`/client-portal/canvas/${prospectId}`} isActive={active === 'canvas'}>
        Canevas
      </NavItem> */}
      <NavItem href={`/client-portal/proposal/${prospectId}`} isActive={active === 'proposal'}>
        Proposition
      </NavItem>
    </div>
  );
};

export default ProspectNavBar;