import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (name: string, email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  loginWithOtp: (email: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ data: any; error: any }>;
  changePassword: (password: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          joinDate: session.user.created_at,
          role: session.user.user_metadata?.role || 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          joinDate: session.user.created_at,
          role: session.user.user_metadata?.role || 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'user'
        }
      }
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (name: string) => {
    if (user) {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (!error) {
        setUser(prev => prev ? { ...prev, displayName: name } : null);
      }
    }
  };

  const loginWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Only allow existing users to login via OTP? Or true for passwordless signup? Let's default to true (default)
      }
    });
    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (data.session) {
      setUser({
        id: data.session.user.id,
        email: data.session.user.email || '',
        displayName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || '',
        joinDate: data.session.user.created_at,
        role: data.session.user.user_metadata?.role || 'user'
      });
    }
    return { data, error };
  };

  const changePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loginWithOtp, verifyOtp, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};