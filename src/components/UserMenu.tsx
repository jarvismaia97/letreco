import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import { 
  signInWithGoogle, 
  signOut, 
  getCurrentUser, 
  onAuthStateChange,
  getDisplayName 
} from '../lib/auth';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function UserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = getDisplayName();

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    const unsubscribe = onAuthStateChange((u) => {
      setUser(u);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="btn btn-ghost btn-sm btn-circle">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content"
        title="Entrar com Google"
      >
        <LogIn size={18} />
        <span className="hidden sm:inline">Entrar</span>
      </button>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || displayName;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="btn btn-ghost btn-sm gap-2"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={userName} 
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <User size={14} className="text-primary-content" />
          </div>
        )}
        <span className="hidden sm:inline max-w-24 truncate">{userName}</span>
        <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-base-200 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-base-300">
            <p className="font-medium truncate">{userName}</p>
            <p className="text-xs text-base-content/60 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-base-300 text-error"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
