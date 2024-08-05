import React from 'react';
import Image from 'next/image';
import { Profile } from '@/types/models';
import { MdOutlineArrowForwardIos } from "react-icons/md";

interface ProfileAvatarGroupProps {
  profiles: Profile[];
  maxDisplay: number;
  onButtonClick: () => void;
}

const ProfileAvatarGroup: React.FC<ProfileAvatarGroupProps> = ({ profiles, maxDisplay, onButtonClick }) => {
  const displayedProfiles = profiles.slice(0, maxDisplay);
  const overflowCount = profiles.length - maxDisplay;

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname[0]}${lastname[0]}`.toUpperCase();
  };

  return (
    <div className="flex items-center w-fit border border-gray-200 bg-gray-200 p-1 rounded-full relative">
      <div className="flex items-center space-x-[-15px]">
        {displayedProfiles.map(profile => (
          <div key={profile.id} className="w-7 h-7 rounded-full overflow-hidden border border-blue-200 shadow-custom-left">
            {profile.blocked ? (
              <Image src="/avatar.svg" alt={`${profile.firstname} ${profile.lastname}`} layout="fill" objectFit="cover" />
            ) : (
              <div className="shadow-2xl w-full h-full flex items-center justify-center bg-blue-200 text-blue-600 text-xs shadow-custom-left">
                {getInitials(profile.firstname, profile.lastname)}
              </div>
            )}
          </div>
        ))}
        {overflowCount > 0 && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-blue-600 text-xs shadow-custom-left">
            +{overflowCount}
          </div>
        )}
      </div>
      <button 
        className="h-7 rounded-full flex items-center justify-center text-blue-600 mx-1" 
        onClick={onButtonClick}
      >
        {profiles.length === 0 ? 'Ajouter' : ''}
        <MdOutlineArrowForwardIos className='ml-1' />
      </button>
    </div>
  );
};

export default ProfileAvatarGroup;
