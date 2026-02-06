import { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Google icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function LoginModal({ visible, onClose }: Props) {
  const { signInWithGoogle, user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!visible) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError('Erro ao entrar com Google. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (e) {
      setError('Erro ao sair. Tenta novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <LogIn className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h2 className="font-bold text-xl">
            {user ? 'A tua conta' : 'Entrar no Letreco'}
          </h2>
          <p className="text-sm text-base-content/60 mt-1">
            {user 
              ? 'Guarda as tuas estatísticas e compete com amigos'
              : 'Sincroniza estatísticas entre dispositivos'
            }
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4 text-sm">
            {error}
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="bg-base-300 rounded-lg p-4 text-center">
              {user.avatarUrl && (
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
              )}
              <p className="font-bold text-lg">{user.displayName}</p>
              {user.email && (
                <p className="text-sm text-base-content/60">{user.email}</p>
              )}
            </div>
            <button
              className="btn btn-outline btn-error btn-block"
              onClick={handleSignOut}
            >
              Terminar sessão
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              className="btn btn-block bg-white hover:bg-gray-100 text-gray-800 border-gray-300 gap-3"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <GoogleIcon />
              )}
              Continuar com Google
            </button>

            <p className="text-xs text-center text-base-content/50 mt-4">
              Ao continuar, aceitas os nossos termos de uso e política de privacidade.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
