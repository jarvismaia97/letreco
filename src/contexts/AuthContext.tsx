import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateDisplayName } from '../lib/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  provider: 'google' | 'apple' | 'anonymous';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function getOrCreatePlayer(supabaseUser: User): Promise<AuthUser | null> {
  if (!supabase) return null;

  // Check if player exists for this auth user
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('id, display_name, avatar_url')
    .eq('auth_user_id', supabaseUser.id)
    .single();

  if (existingPlayer) {
    return {
      id: existingPlayer.id,
      email: supabaseUser.email || null,
      displayName: existingPlayer.display_name,
      avatarUrl: existingPlayer.avatar_url,
      provider: (supabaseUser.app_metadata?.provider as 'google' | 'apple') || 'anonymous',
    };
  }

  // Create new player with random username
  const displayName = generateDisplayName();
  const avatarUrl = supabaseUser.user_metadata?.avatar_url || null;

  const { data: newPlayer, error } = await supabase
    .from('players')
    .insert({
      auth_user_id: supabaseUser.id,
      display_name: displayName,
      avatar_url: avatarUrl,
      email: supabaseUser.email,
    })
    .select('id, display_name, avatar_url')
    .single();

  if (error || !newPlayer) {
    console.error('Failed to create player:', error);
    return null;
  }

  // Store in localStorage for offline access
  localStorage.setItem('letreco_player_id', newPlayer.id);
  localStorage.setItem('letreco_display_name', newPlayer.display_name);

  return {
    id: newPlayer.id,
    email: supabaseUser.email || null,
    displayName: newPlayer.display_name,
    avatarUrl: newPlayer.avatar_url,
    provider: (supabaseUser.app_metadata?.provider as 'google' | 'apple') || 'anonymous',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const authUser = await getOrCreatePlayer(session.user);
        setUser(authUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUser = await getOrCreatePlayer(session.user);
        setUser(authUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('letreco_player_id');
        localStorage.removeItem('letreco_display_name');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    if (error) {
      console.error('Apple sign-in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithApple,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
