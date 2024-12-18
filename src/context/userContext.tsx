import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Profile } from '@/types/models';
import { getUserDetails } from '@/services/profileService';

interface UserContextProps {
  user: Profile | null;
  setUser: React.Dispatch<React.SetStateAction<Profile | null>>;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const router = useRouter();
  const fetchUser = async () => {
    const user = await getUserDetails();
    if (user) {
      setUser(user);
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, [router]);

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, setUser, refetchUser}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
