import { useState } from 'react';
import { X, User, LogOut, Edit2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateDisplayName } from '../lib/auth';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({ visible, onClose, onLogout }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setNewName(user?.displayName || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const success = await updateDisplayName(newName.trim());
    if (success) {
      setEditing(false);
      // Reload to update context
      window.location.reload();
    }
    setSaving(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div 
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-sm relative" 
        onClick={e => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-full" />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          
          {editing ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="input input-bordered input-sm w-40"
                maxLength={30}
                autoFocus
              />
              <button 
                className="btn btn-sm btn-primary btn-circle"
                onClick={handleSave}
                disabled={saving || !newName.trim()}
              >
                {saving ? <span className="loading loading-spinner loading-xs" /> : <Check className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-bold text-xl">{user?.displayName || 'Jogador'}</h2>
              {isAuthenticated && (
                <button className="btn btn-ghost btn-xs btn-circle" onClick={handleEdit}>
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          
          {user?.email && (
            <p className="text-sm text-base-content/60 mt-1">{user.email}</p>
          )}
        </div>

        {isAuthenticated && (
          <button 
            className="btn btn-outline btn-error w-full"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Terminar Sessão
          </button>
        )}
      </div>
    </div>
  );
}
