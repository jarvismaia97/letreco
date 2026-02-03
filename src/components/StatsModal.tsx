import { useState } from 'react';
import { MAX_ATTEMPTS } from '../constants';
import type { GameStats, GameMode } from '../hooks/useGame';

interface Props {
  visible: boolean;
  onClose: () => void;
  stats: GameStats;
  gameOver: boolean;
  won: boolean;
  answer: string;
  shareText: string;
  gameMode: GameMode;
}

export default function StatsModal({ visible, onClose, stats, gameOver, won, answer, shareText, gameMode }: Props) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  if (!visible) return null;

  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution, 1);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  };

  const handleCopyResult = async () => {
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    await copyToClipboard('https://letreco.app');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3" onClick={onClose}>
          ✕
        </button>

        {gameOver && !won && (
          <p className="text-center font-bold text-[var(--color-present)] mb-3">
            A palavra era: {answer}
          </p>
        )}

        <h2 className="text-center font-bold text-sm tracking-widest mb-3">ESTATÍSTICAS</h2>

        <div className="flex justify-around mb-4">
          {[
            { val: stats.played, label: 'Jogos' },
            { val: winPct, label: '% Vitórias' },
            { val: stats.currentStreak, label: 'Sequência', emoji: '🔥' },
            { val: stats.maxStreak, label: 'Melhor Seq.', emoji: '🔥' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold">
                {s.emoji && s.val > 0 ? `${s.emoji} ` : ''}{s.val}
              </div>
              <div className="text-xs text-base-content/60">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-center font-bold text-sm tracking-widest mb-2">DISTRIBUIÇÃO</h2>

        <div className="space-y-1 mb-4">
          {stats.distribution.map((count, i) => (
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

        {gameOver && gameMode === 'daily' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn bg-[var(--color-correct)] hover:bg-[var(--color-correct)]/90 text-white font-bold border-none"
                onClick={handleCopyResult}
              >
                {copied ? '✅ Copiado!' : '📋 Copiar resultado'}
              </button>
              <button
                className="btn bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold border-none"
                onClick={handleWhatsApp}
              >
                💬 WhatsApp
              </button>
              <button
                className="btn bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-bold border-none"
                onClick={handleTwitter}
              >
                🐦 X / Twitter
              </button>
              <button
                className="btn bg-base-300 hover:bg-base-300/90 text-base-content font-bold border-none"
                onClick={handleCopyLink}
              >
                {linkCopied ? '✅ Copiado!' : '🔗 Copiar link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
