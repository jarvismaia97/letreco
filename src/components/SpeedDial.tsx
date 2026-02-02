import { useState, useRef, useEffect } from 'react';
import type { GameMode } from '../hooks/useGame';

interface Props {
  themeMode: 'dark' | 'light';
  gameMode: GameMode;
  onHelp: () => void;
  onToggleTheme: () => void;
  onStats: () => void;
  onLeaderboard: () => void;
  onToggleGameMode: () => void;
}

export default function SpeedDial({
  themeMode,
  gameMode,
  onHelp,
  onToggleTheme,
  onStats,
  onLeaderboard,
  onToggleGameMode,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items = [
    { emoji: '❓', label: 'Como jogar', action: onHelp },
    { emoji: themeMode === 'dark' ? '☀️' : '🌙', label: 'Toggle tema', action: onToggleTheme },
    { emoji: '📊', label: 'Estatísticas', action: onStats },
    { emoji: '🏆', label: 'Leaderboard', action: onLeaderboard },
    {
      emoji: '🎮',
      label: gameMode === 'daily' ? 'Modo: Palavra do Dia → Treino' : 'Modo: Treino → Palavra do Dia',
      action: onToggleGameMode,
    },
  ];

  return (
    <div ref={ref} className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
      {/* FAB button */}
      <button
        className={`btn btn-circle btn-primary shadow-lg transition-transform ${open ? 'rotate-45' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          )}
          {!open && <circle cx="12" cy="12" r="3" strokeWidth={2} />}
        </svg>
      </button>

      {/* Speed dial items */}
      {open && (
        <div className="flex flex-col items-end gap-1.5 animate-[fadeIn_150ms_ease-out]">
          {items.map((item, i) => (
            <div key={i} className="tooltip tooltip-left" data-tip={item.label}>
              <button
                className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 shadow text-base"
                onClick={() => {
                  item.action();
                  if (item.emoji !== '☀️' && item.emoji !== '🌙') setOpen(false);
                }}
              >
                {item.emoji}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
