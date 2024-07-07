import Image from 'next/image';
import React from 'react';

const UserProfile = ({ name, email, isCollapsed }: { name: string; email: string, isCollapsed: boolean }) => {
  return (
    <div className={`flex items-center w-full mb-6 bg-gray-100 rounded-md ${isCollapsed ? 'p-1' : 'p-3'}`}>
      <div><Image src="/avatar.svg" alt={name} width={50} height={50} className="rounded-full mr-3" /></div>
      {!isCollapsed && <div>
        <p className="font-semibold">{name}</p>
        <p className="text-gray-500 text-sm">{email}</p>
      </div>}
    </div>
  );
};

export default UserProfile;
