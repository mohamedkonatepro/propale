import React, { useEffect, useState } from 'react';
import { fetchPrimaryContactByCompanyId } from '@/services/profileService';
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { Profile } from '@/types/models';

type PrimaryContactProps = {
  companyId: string;
};

const PrimaryContact: React.FC<PrimaryContactProps> = ({ companyId }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getPrimaryContact = async () => {
      const fetchedProfile = await fetchPrimaryContactByCompanyId(companyId);
      setProfile(fetchedProfile);
    };

    getPrimaryContact();
  }, [companyId]);

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex flex-col text-xs'>
      <div className='text-sm'>{profile.firstname} {profile.lastname}</div>
      <div className='text-stone-400'>{profile.position}</div>
      {profile.phone && <div className='flex items-center text-blue-600'>
        <FiPhone />
        <div className='ml-1'>{profile.phone}</div>
      </div>}
      {profile.email && <div className='flex items-center text-blue-600'>
        <MdOutlineEmail />
        <div className='ml-1'>{profile.email}</div>
      </div>}
    </div>
  );
};

export default PrimaryContact;
