import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useUser, useClerk } from '@clerk/clerk-react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, openSignIn, openSignUp } = useClerk();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (clerkUser) {
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        displayName: clerkUser.fullName || '',
        joinDate: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
        role: (clerkUser.publicMetadata?.role as 'user' | 'admin') || 'user'
      });
    } else {
      setUser(null);
    }
  }, [clerkUser]);

  const login = async () => {
    openSignIn();
  };

  const register = async () => {
    openSignUp();
  };

  const logout = () => {
    signOut();
  };

  const updateProfile = async (name: string) => {
    if (clerkUser) {
      await clerkUser.update({
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading: !isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};