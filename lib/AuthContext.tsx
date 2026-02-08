import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface CrewProfile {
  id: string;
  name: string;
  role: 'Pilot' | 'Ground Crew';
  email: string;
  image_url: string;
  experience_years: number;
  flights: number;
  specialty: string;
  bio: string;
  availability: 'available' | 'busy';
}

interface AuthState {
  session: Session | null;
  user: User | null;
  crewProfile: CrewProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  userRole: 'pilot' | 'crew' | null;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [crewProfile, setCrewProfile] = useState<CrewProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCrewProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('crew_members')
      .select('id, name, role, email, image_url, experience_years, flights, specialty, bio, availability')
      .eq('user_id', userId)
      .maybeSingle();

    setCrewProfile(data as CrewProfile | null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchCrewProfile(s.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        (async () => {
          await fetchCrewProfile(s.user.id);
        })();
      } else {
        setCrewProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCrewProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCrewProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchCrewProfile(user.id);
    }
  }, [user, fetchCrewProfile]);

  const userRole: 'pilot' | 'crew' | null = crewProfile
    ? crewProfile.role === 'Pilot' ? 'pilot' : 'crew'
    : null;

  return (
    <AuthContext.Provider value={{ session, user, crewProfile, loading, signIn, signOut, refreshProfile, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
