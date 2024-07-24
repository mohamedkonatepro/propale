import { Profile } from '@/types/models';
import Image from 'next/image';
import React from 'react';

const UserProfile = ({ user, isCollapsed, handleEditUser }: { user: Profile, isCollapsed: boolean, handleEditUser: () => void }) => {
  return (
    <div onClick={handleEditUser} className={`cursor-pointer flex items-center w-full mb-6 bg-gray-100 rounded-md ${isCollapsed ? 'p-1' : 'p-3'}`}>
      <div><Image src="/avatar.svg" alt={user.lastname} width={50} height={50} className="rounded-full mr-3" /></div>
      {!isCollapsed && <div>
        <p className="font-semibold">{user.firstname} {user.lastname}</p>
        <p className="text-gray-500 text-sm">{user.email}</p>
      </div>}
    </div>
  );
};

export default UserProfile;
