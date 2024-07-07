import React, { useState } from 'react';
import UserProfile from './UserProfile';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdFolderOpen } from "react-icons/md";
import { PiUsers } from "react-icons/pi";
import { SlSettings } from "react-icons/sl";

import Link from 'next/link';
import Image from 'next/image';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`min-h-screen bg-white flex flex-col items-center p-4 shadow-md ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <button onClick={toggleSidebar} className="self-end mb-4">
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft /> }
      </button>
      <Link href="/" className="flex mb-6">
        <Image src="/logo.svg" alt="Propale" width={isCollapsed ? 30 : 40} height={isCollapsed ? 30 : 40} className="mr-2" />
        {!isCollapsed && <span className="text-2xl font-bold">Propale</span>}
      </Link>
      <UserProfile name="Jane Doe" email="jane.doe@email.com" isCollapsed={isCollapsed}/>
      <nav className="mt-6 w-full">
        <NavigationLink href="/mes-dossiers" icon={MdFolderOpen} text="Mes dossiers" active isCollapsed={isCollapsed} />
        <NavigationLink href="/utilisateurs" icon={PiUsers} text="Utilisateurs" count={23} isCollapsed={isCollapsed} />
      </nav>
      <div className="mt-auto w-full">
        <NavigationLink href="/parametres" icon={SlSettings} text="Paramètres" isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

const NavigationLink = ({ href, icon: Icon, text, active = false, count, isCollapsed }: any) => {
  return (
    <Link href={href} className={`flex items-center ${isCollapsed ? 'p-2' : 'p-3'} rounded-md w-full ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>
      <div><Icon className="mr-3" size="30" /></div>
      {!isCollapsed && <span className="flex-1">{text}</span>}
      {!isCollapsed && count && <span className="text-sm bg-gray-400 rounded-md px-2 py-0.5 text-white">{count}</span>}
    </Link>
  );
};

export default Sidebar;
