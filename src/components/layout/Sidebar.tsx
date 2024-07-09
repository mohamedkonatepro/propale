import React, { useEffect, useState } from 'react';
import UserProfile from './UserProfile';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdFolderOpen } from "react-icons/md";
import { PiUsers } from "react-icons/pi";
import { SlSettings } from "react-icons/sl";
import Link from 'next/link';
import Image from 'next/image';
import { Company, Profile } from '@/types/models';
import { fetchCompanyWithoutParentByProfileId } from '@/services/companyService';
import { fetchProfileCountByCompanyId } from '@/services/userService';


interface SidebarProps {
  user: Profile;
  currentPage: string
}

interface NavigationLinkProps {
  href: string;
  icon: React.ElementType;
  text: string;
  active?: boolean;
  count?: number;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage = "folders" }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [profileCount, setProfileCount] = useState<number>(0);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const getCompany = async () => {
      const companyData = await fetchCompanyWithoutParentByProfileId(user?.id);
      setCompany(companyData);
    };

    const getProfileCount = async (companyId: string) => {
      const count = await fetchProfileCountByCompanyId(companyId);
      setProfileCount(count)
    };
    if (company) {
      getProfileCount(company.id)
    }
    getCompany();
  }, [company, user]);
  return (
    <div className={`min-h-screen bg-white flex flex-col items-center p-4 shadow-md ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <button onClick={toggleSidebar} className="self-end mb-4">
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft /> }
      </button>
      <Link href="/" className="flex mb-6">
        <Image src="/logo.svg" alt="Propale" width={isCollapsed ? 30 : 40} height={isCollapsed ? 30 : 40} className="mr-2" />
        {!isCollapsed && <span className="text-2xl font-bold">Propale</span>}
      </Link>
      <UserProfile name={`${user?.firstname} ${user?.lastname}`} email={user?.email} isCollapsed={isCollapsed}/>
      <nav className="mt-6 w-full">
        {company && (
          <>
          <NavigationLink href={`/dashboard/folders/${company.id}`} icon={MdFolderOpen} text="Mes dossiers" active={currentPage === "folders"} isCollapsed={isCollapsed} />
          <NavigationLink href={`/dashboard/users/${company.id}`} icon={PiUsers} text="Utilisateurs" active={currentPage === "users"} count={profileCount} isCollapsed={isCollapsed} />
          </>
        )}
      </nav>
      <div className="mt-auto w-full">
        <NavigationLink href="/parametres" icon={SlSettings} active={currentPage === "settings"} text="Paramètres" isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

const NavigationLink: React.FC<NavigationLinkProps> = ({ href, icon: Icon, text, active = false, count, isCollapsed }) => {
  return (
    <Link href={href} className={`flex items-center ${isCollapsed ? 'p-2' : 'p-3'} rounded-md w-full ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>
      <div><Icon className="mr-3" size="30" /></div>
      {!isCollapsed && <span className="flex-1">{text}</span>}
      {!isCollapsed && count && <span className={`text-sm ${active ? 'bg-blue-600' : 'bg-gray-400'} rounded-md px-2 py-0.5 text-white`}>{count}</span>}
    </Link>
  );
};

export default Sidebar;
