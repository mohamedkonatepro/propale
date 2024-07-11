import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Profile } from '@/types/models';
import { getUserDetails } from '@/services/profileService';

interface UserContextProps {
  user: Profile | null;
  setUser: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserDetails();
      if (user) {
        setUser(user);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
