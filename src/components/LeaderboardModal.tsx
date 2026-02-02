import { MAX_ATTEMPTS } from '../constants';
import type { GameStats } from '../hooks/useGame';

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
      agg.distribution[i] += (s.distribution[i] || 0);
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

export default function LeaderboardModal({ visible, onClose }: Props) {
  if (!visible) return null;

  const allStats = MODES.map((m) => ({ mode: m, stats: loadStats(m) }));
  const total = aggregate(allStats.map((s) => s.stats));
  const winPct = total.played > 0 ? Math.round((total.wins / total.played) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          ✕
        </button>

        <h2 className="text-center font-bold text-sm tracking-widest mb-3">🏆 LEADERBOARD</h2>

        {/* Totals */}
        <div className="flex justify-around mb-4">
          <StatCard val={total.played} label="Jogos" />
          <StatCard val={`${winPct}%`} label="Vitórias" />
          <StatCard val={total.currentStreak} label="Sequência" />
          <StatCard val={total.maxStreak} label="Melhor Seq." />
        </div>

        <h3 className="text-center font-bold text-xs tracking-widest mb-2">DISTRIBUIÇÃO TOTAL</h3>
        <DistributionChart distribution={total.distribution} />

        {/* Per-mode breakdown */}
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
                  <div className="flex justify-between"><span>Sequência</span><span>🔥 {stats.currentStreak}</span></div>
                  <div className="flex justify-between"><span>Melhor</span><span>🔥 {stats.maxStreak}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
