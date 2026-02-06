import { useState, useEffect } from 'react';
import { X, Users, Plus, LogIn, ChevronRight, Trash2 } from 'lucide-react';
import { getMyGroups, createGroup, joinGroupByCode, leaveGroup, deleteGroup, type FriendGroup } from '../lib/groups';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectGroup: (groupId: string) => void;
  letterMode: number;
}

export default function GroupsModal({ visible, onClose, onSelectGroup, letterMode }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && user?.id) {
      loadGroups();
    }
  }, [visible, user?.id]);

  const loadGroups = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getMyGroups(user.id);
    setGroups(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user?.id || !newGroupName.trim()) return;
    setSubmitting(true);
    setError('');
    
    const group = await createGroup(newGroupName.trim(), user.id);
    if (group) {
      setGroups([...groups, group]);
      setNewGroupName('');
      setShowCreate(false);
    } else {
      setError('Erro ao criar grupo');
    }
    setSubmitting(false);
  };

  const handleJoin = async () => {
    if (!user?.id || !inviteCode.trim()) return;
    setSubmitting(true);
    setError('');

    const result = await joinGroupByCode(inviteCode.trim(), user.id);
    if (result.success && result.group) {
      setGroups([...groups, result.group]);
      setInviteCode('');
      setShowJoin(false);
    } else {
      setError(result.error || 'Erro ao entrar no grupo');
    }
    setSubmitting(false);
  };

  const handleLeave = async (groupId: string) => {
    if (!user?.id) return;
    if (!confirm('Tens a certeza que queres sair deste grupo?')) return;
    
    const success = await leaveGroup(groupId, user.id);
    if (success) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Tens a certeza que queres apagar este grupo? Esta ação é irreversível.')) return;
    
    const success = await deleteGroup(groupId);
    if (success) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div 
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-sm relative max-h-[85vh] overflow-hidden flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3 z-10" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <Users className="w-10 h-10 mx-auto mb-2 text-primary" />
          <h2 className="font-bold text-xl">Grupos de Amigos</h2>
          <p className="text-sm text-base-content/60">{letterMode} letras</p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-8">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-base-content/40" />
            <p className="text-base-content/60 mb-4">
              Faz login para criar ou entrar em grupos
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="alert alert-error mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Create/Join buttons */}
            <div className="flex gap-2 mb-4">
              <button 
                className="btn btn-sm btn-primary flex-1"
                onClick={() => { setShowCreate(true); setShowJoin(false); setError(''); }}
              >
                <Plus className="w-4 h-4" /> Criar
              </button>
              <button 
                className="btn btn-sm btn-outline flex-1"
                onClick={() => { setShowJoin(true); setShowCreate(false); setError(''); }}
              >
                <LogIn className="w-4 h-4" /> Entrar
              </button>
            </div>

            {/* Create form */}
            {showCreate && (
              <div className="bg-base-300 rounded-lg p-3 mb-4">
                <input
                  type="text"
                  placeholder="Nome do grupo"
                  className="input input-bordered input-sm w-full mb-2"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  maxLength={50}
                />
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm btn-ghost flex-1"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-sm btn-primary flex-1"
                    onClick={handleCreate}
                    disabled={!newGroupName.trim() || submitting}
                  >
                    {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Criar'}
                  </button>
                </div>
              </div>
            )}

            {/* Join form */}
            {showJoin && (
              <div className="bg-base-300 rounded-lg p-3 mb-4">
                <input
                  type="text"
                  placeholder="Código de convite"
                  className="input input-bordered input-sm w-full mb-2"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  maxLength={20}
                />
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm btn-ghost flex-1"
                    onClick={() => setShowJoin(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-sm btn-primary flex-1"
                    onClick={handleJoin}
                    disabled={!inviteCode.trim() || submitting}
                  >
                    {submitting ? <span className="loading loading-spinner loading-xs" /> : 'Entrar'}
                  </button>
                </div>
              </div>
            )}

            {/* Groups list */}
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Ainda não tens grupos</p>
                  <p className="text-xs mt-1">Cria um ou entra com código</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groups.map(group => (
                    <div 
                      key={group.id}
                      className="bg-base-300 rounded-lg p-3 flex items-center gap-3"
                    >
                      <button
                        className="flex-1 flex items-center gap-3 text-left"
                        onClick={() => onSelectGroup(group.id)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{group.name}</p>
                          <p className="text-xs text-base-content/50">
                            {group.is_owner ? '👑 Dono' : 'Membro'}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-base-content/40" />
                      </button>
                      
                      {group.is_owner ? (
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => handleDelete(group.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleLeave(group.id)}
                        >
                          <LogIn className="w-4 h-4 rotate-180" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
