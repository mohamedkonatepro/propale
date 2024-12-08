import { truncateString } from '@/lib/utils';
import { Profile } from '@/types/models';
import Image from 'next/image';
import React from 'react';

const UserProfile = ({ user, isCollapsed, handleEditUser }: { user: Profile, isCollapsed: boolean, handleEditUser: () => void }) => {
  return (
    <div onClick={handleEditUser} className={`cursor-pointer flex items-center w-full mb-6 border border-2 border-blue-100 rounded-lg p-1`}>
      <div><Image src="/avatar.svg" alt={user.lastname} width={40} height={40} className="rounded-full mr-3" /></div>
      {!isCollapsed && <div>
        <p className="text-black">{user.firstname} {user.lastname}</p>
        <p className="text-gray-400 text-sm">{truncateString(user.email, 17)}</p>
      </div>}
    </div>
  );
};

export default UserProfile;
