'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { getUserProfile, syncUserInDb, updateUserProfile as updateDbProfile } from '@/app/actions/userActions';

interface DbProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  tenantId: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: DbProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSyncProfile = async (currentUser: User) => {
    try {
      let dbUser = await getUserProfile(currentUser.id);
      
      // If user profile doesn't exist in Prisma but does in Supabase (e.g. freshly registered), sync them.
      if (!dbUser && currentUser.email) {
        dbUser = await syncUserInDb(
          currentUser.id,
          currentUser.email,
          currentUser.user_metadata?.name || 'CaterFlow Admin',
          currentUser.user_metadata?.phone || ''
        );
      }
      
      setProfile(dbUser as DbProfile | null);
    } catch (err) {
      console.error('Error fetching or syncing user profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchAndSyncProfile(user);
    }
  };

  useEffect(() => {
    // 1. Initial session check
    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchAndSyncProfile(initialSession.user);
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchAndSyncProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
