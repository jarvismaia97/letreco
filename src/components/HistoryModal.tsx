import { useState, useEffect } from 'react';
import { fetchGameHistory } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface GameRecord {
  id: string;
  letter_mode: number;
  game_mode: string;
  word: string;
  attempts: number;
  won: boolean;
  played_at: string;
  daily_date: string | null;
}

const MODES = [0, 4, 5, 6, 7] as const;

export default function HistoryModal({ visible, onClose }: Props) {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [letterFilter, setLetterFilter] = useState(0);
  const [modeFilter, setModeFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !isSupabaseConfigured()) return;
    setLoading(true);
    fetchGameHistory({
      letterMode: letterFilter || undefined,
      gameMode: modeFilter || undefined,
      limit: 50,
    })
      .then((data: GameRecord[]) => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [visible, letterFilter, modeFilter]);

  if (!visible) return null;
  const isOnline = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          ✕
        </button>
        <h2 className="text-center font-bold text-sm tracking-widest mb-3">📜 HISTÓRICO</h2>
        {!isOnline ? (
          <p className="text-center text-sm text-base-content/60 py-4">
            Conecte ao Supabase para ver o histórico online.
          </p>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
              {MODES.map((m) => (
                <button
                  key={m}
                  className={`btn btn-xs ${letterFilter === m ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setLetterFilter(m)}
                >
                  {m === 0 ? 'Todos' : `${m} letras`}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2 mb-4">
              <button className={`btn btn-xs ${modeFilter === '' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setModeFilter('')}>Todos</button>
              <button className={`btn btn-xs ${modeFilter === 'daily' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setModeFilter('daily')}>☀️ Diário</button>
              <button className={`btn btn-xs ${modeFilter === 'practice' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setModeFilter('practice')}>🔄 Treino</button>
            </div>
            {loading ? (
              <div className="text-center py-4"><span className="loading loading-spinner loading-sm" /></div>
            ) : games.length === 0 ? (
              <p className="text-center text-sm text-base-content/60 py-4">Nenhum jogo encontrado.</p>
            ) : (
              <div className="space-y-2">
                {games.map((game) => {
                  const date = new Date(game.played_at);
                  const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                  return (
                    <div
                      key={game.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${game.won ? 'bg-success/10' : 'bg-error/10'}`}
                    >
                      <span className="text-lg">{game.won ? '✅' : '❌'}</span>
                      <div className="flex-1">
                        <div className="font-bold uppercase">{game.word}</div>
                        <div className="text-xs text-base-content/60">
                          {dateStr} · {game.letter_mode} letras · {game.game_mode === 'daily' ? '☀️' : '🔄'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{game.attempts}/6</div>
                        <div className="text-xs text-base-content/60">tentativas</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
