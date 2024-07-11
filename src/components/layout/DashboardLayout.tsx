import React from 'react';
import { Profile } from '@/types/models';
import Sidebar from '@/components/layout/Sidebar';

interface DashboardLayoutProps {
  currentPage: string;
  children: React.ReactNode;
  setPage: (page: string) => void;
  isDashboardHome: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ currentPage, setPage, children, isDashboardHome }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar currentPage={currentPage} setPage={setPage} isDashboardHome={isDashboardHome} />
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
