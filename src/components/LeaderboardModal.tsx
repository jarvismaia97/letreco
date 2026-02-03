import { useState, useEffect } from 'react';
import { X, Trophy, Flame } from 'lucide-react';
import { MAX_ATTEMPTS } from '../constants';
import type { GameStats } from '../hooks/useGame';
import { fetchLeaderboard, getPlayerId, type LeaderboardEntry } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const MODES = [4, 5, 6, 7] as const;
const DEFAULT_STATS: GameStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array(MAX_ATTEMPTS).fill(0),
};

function loadStats(mode: number): GameStats {
  try {
    const v = localStorage.getItem(`letreco_stats_${mode}`);
    return v ? JSON.parse(v) : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

function aggregate(allStats: GameStats[]): GameStats {
  const agg: GameStats = { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: Array(MAX_ATTEMPTS).fill(0) };
  for (const s of allStats) {
    agg.played += s.played;
    agg.wins += s.wins;
    agg.currentStreak += s.currentStreak;
    agg.maxStreak = Math.max(agg.maxStreak, s.maxStreak);
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      agg.distribution[i] += s.distribution[i] || 0;
    }
  }
  return agg;
}

function StatCard({ val, label }: { val: number | string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{val}</div>
      <div className="text-xs text-base-content/60">{label}</div>
    </div>
  );
}

function DistributionChart({ distribution }: { distribution: number[] }) {
  const maxDist = Math.max(...distribution, 1);
  return (
    <div className="space-y-1">
      {distribution.map((count, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-4 text-right text-sm font-bold">{i + 1}</span>
          <div
            className="rounded px-2 py-0.5 text-right text-sm font-bold text-white"
            style={{
              width: `${Math.max((count / maxDist) * 100, 7)}%`,
              backgroundColor: count > 0 ? 'var(--color-correct)' : 'var(--color-absent)',
            }}
          >
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}

function LocalStatsView() {
  const allStats = MODES.map((m) => ({ mode: m, stats: loadStats(m) }));
  const total = aggregate(allStats.map((s) => s.stats));
  const winPct = total.played > 0 ? Math.round((total.wins / total.played) * 100) : 0;

  return (
    <>
      <div className="flex justify-around mb-4">
        <StatCard val={total.played} label="Jogos" />
        <StatCard val={`${winPct}%`} label="Vitórias" />
        <StatCard val={total.currentStreak} label="Sequência" />
        <StatCard val={total.maxStreak} label="Melhor Seq." />
      </div>

      <h3 className="text-center font-bold text-xs tracking-widest mb-2">DISTRIBUIÇÃO TOTAL</h3>
      <DistributionChart distribution={total.distribution} />

      <div className="divider my-4" />
      <h3 className="text-center font-bold text-xs tracking-widest mb-3">POR MODO</h3>

      <div className="grid grid-cols-2 gap-3">
        {allStats.map(({ mode, stats }) => {
          const wp = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
          return (
            <div key={mode} className="bg-base-300 rounded-lg p-3">
              <div className="font-bold text-center mb-1">{mode} letras</div>
              <div className="text-xs text-base-content/70 space-y-0.5">
                <div className="flex justify-between"><span>Jogos</span><span>{stats.played}</span></div>
                <div className="flex justify-between"><span>Vitórias</span><span>{wp}%</span></div>
                <div className="flex justify-between"><span>Sequência</span><span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {stats.currentStreak}</span></div>
                <div className="flex justify-between"><span>Melhor</span><span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {stats.maxStreak}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function OnlineLeaderboardView() {
  const [selectedMode, setSelectedMode] = useState(5);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const playerId = getPlayerId();

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(selectedMode)
      .then(({ entries, playerRank }) => {
        setEntries(entries);
        setPlayerRank(playerRank);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedMode]);

  return (
    <>
      {/* Mode tabs */}
      <div className="flex justify-center gap-2 mb-4">
        {MODES.map((m) => (
          <button
            key={m}
            className={`btn btn-xs ${selectedMode === m ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedMode(m)}
          >
            {m} letras
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-base-content/60 py-8">
          Ainda não há jogadores suficientes neste modo.
          <br />
          Jogue pelo menos 3 partidas para aparecer!
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => {
            const isCurrentPlayer = playerId && entry.id === playerId;
            const rank = idx + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isCurrentPlayer ? 'bg-primary/20 ring-1 ring-primary' : 'bg-base-300'
                }`}
              >
                <span className="w-8 text-center font-bold">
                  {medal || `#${rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">
                    {entry.display_name}
                    {isCurrentPlayer && <span className="ml-1 text-xs opacity-60">(você)</span>}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {entry.games_played} jogos
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success">{entry.win_rate}%</div>
                  <div className="text-xs text-base-content/60">
                    ~{entry.avg_attempts || '-'} tent.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {playerRank && playerRank > 20 && (
        <p className="text-center text-sm text-base-content/60 mt-4">
          Você está em #{playerRank} lugar
        </p>
      )}

      <div className="divider my-4" />
      <h3 className="text-center font-bold text-xs tracking-widest mb-3">SUAS ESTATÍSTICAS LOCAIS</h3>
      <LocalStatsView />
    </>
  );
}

export default function LeaderboardModal({ visible, onClose }: Props) {
  if (!visible) return null;

  const isOnline = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-center font-bold text-sm tracking-widest mb-3 flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5" /> LEADERBOARD
        </h2>

        {isOnline ? <OnlineLeaderboardView /> : <LocalStatsView />}

        {!isOnline && (
          <p className="text-center text-xs text-base-content/40 mt-4">
            Conecte ao Supabase para ver o leaderboard global
          </p>
        )}
      </div>
    </div>
  );
}
