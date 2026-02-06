import { useState, useEffect } from 'react';
import { X, Users, Trophy, Clock, Target, HelpCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import { getGroupDailyRanking, getGroupDetails, type GroupMember, type FriendGroup } from '../lib/groups';

interface Props {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  groupId: string;
  letterMode: number;
}

export default function GroupLeaderboardModal({ visible, onClose, onBack, groupId, letterMode }: Props) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [group, setGroup] = useState<FriendGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible && groupId) {
      loadData();
    }
  }, [visible, groupId, letterMode]);

  const loadData = async () => {
    setLoading(true);
    const [groupData, membersData] = await Promise.all([
      getGroupDetails(groupId),
      getGroupDailyRanking(groupId, letterMode)
    ]);
    setGroup(groupData);
    setMembers(membersData);
    setLoading(false);
  };

  const copyInviteCode = async () => {
    if (!group) return;
    await navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const today = new Date().toLocaleDateString('pt-PT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

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
        
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 left-3 z-10" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-4 pt-2">
          <Trophy className="w-10 h-10 mx-auto mb-2 text-warning" />
          <h2 className="font-bold text-xl">{group?.name || 'Grupo'}</h2>
          <p className="text-sm text-base-content/60 capitalize">{today}</p>
          <p className="text-xs text-base-content/40 mt-1">{letterMode} letras</p>
        </div>

        {/* Invite code */}
        {group && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-base-content/50">Código:</span>
            <code className="bg-base-300 px-2 py-1 rounded text-sm">{group.invite_code}</code>
            <button
              className="btn btn-ghost btn-xs"
              onClick={copyInviteCode}
            >
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Members list */}
        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum membro ainda jogou hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div 
                  key={member.player_id} 
                  className={`rounded-lg p-3 flex items-center gap-3 ${
                    index === 0 && member.won 
                      ? 'bg-warning/20 border border-warning/30' 
                      : 'bg-base-300'
                  }`}
                >
                  {/* Position */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    !member.played ? 'bg-base-100 text-base-content/30' :
                    index === 0 ? 'bg-warning text-warning-content' :
                    index === 1 ? 'bg-base-content/20' :
                    index === 2 ? 'bg-amber-700/50' :
                    'bg-base-100'
                  }`}>
                    {member.played ? index + 1 : '-'}
                  </div>

                  {/* Avatar */}
                  {member.avatar_url ? (
                    <img 
                      src={member.avatar_url} 
                      alt="" 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  {/* Name & Status */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.display_name}</p>
                    {member.played ? (
                      <div className="flex items-center gap-2 text-xs text-base-content/60">
                        {member.won ? (
                          <>
                            <span className="flex items-center gap-1 text-success">
                              <Target className="w-3 h-3" />
                              {member.attempts} tentativas
                            </span>
                          </>
                        ) : (
                          <span className="text-error">Não acertou</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-base-content/40">
                        <Clock className="w-3 h-3" />
                        Ainda não jogou
                      </div>
                    )}
                  </div>

                  {/* Result indicator */}
                  {member.played && (
                    <div className={`text-2xl ${member.won ? '' : 'grayscale opacity-50'}`}>
                      {member.won ? (
                        member.attempts === 1 ? '🏆' :
                        member.attempts === 2 ? '🥇' :
                        member.attempts === 3 ? '🥈' :
                        member.attempts === 4 ? '🥉' :
                        '✅'
                      ) : '❌'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-base-300 text-xs text-base-content/50 text-center">
          <HelpCircle className="w-3 h-3 inline mr-1" />
          Ranking baseado em: vitória → menos tentativas → primeiro a jogar
        </div>
      </div>
    </div>
  );
}
