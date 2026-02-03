import { useState, useRef, useEffect } from 'react';
import type { GameMode } from '../hooks/useGame';

interface Props {
  themeMode: 'dark' | 'light';
  gameMode: GameMode;
  onToggleTheme: () => void;
  onStats: () => void;
  onHistory: () => void;
  onToggleGameMode: () => void;
}

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function SpeedDial({
  themeMode,
  gameMode,
  onToggleTheme,
  onStats,
  onHistory,
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
    { icon: themeMode === 'dark' ? <SunIcon /> : <MoonIcon />, label: themeMode === 'dark' ? 'Tema claro' : 'Tema escuro', action: onToggleTheme, keepOpen: true },
    { icon: <ChartIcon />, label: 'Estatísticas', action: onStats },
    { icon: <HistoryIcon />, label: 'Histórico', action: onHistory },
    { icon: <GamepadIcon />, label: gameMode === 'daily' ? 'Treino' : 'Palavra do Dia', action: onToggleGameMode },
  ];

  return (
    <div ref={ref} className="relative z-40">
      {/* Main FAB */}
      <button
        className="btn btn-circle btn-primary shadow-xl relative z-10 transition-transform duration-200"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Flower items - expand downward-left from FAB */}
      {items.map((item, i) => {
        // Spread items in an arc going down-left
        const angle = Math.PI * 0.5 + (i / (items.length - 1)) * Math.PI * 0.5;
        const radius = 60;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={i}
            className="absolute top-2 right-2 tooltip tooltip-left"
            data-tip={item.label}
            style={{
              transform: open
                ? `translate(${x}px, ${y}px) scale(1)`
                : 'translate(0, 0) scale(0)',
              opacity: open ? 1 : 0,
              transition: `all 250ms cubic-bezier(0.34, 1.56, 0.64, 1) ${open ? i * 50 : 0}ms`,
            }}
          >
            <button
              className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border-base-300 shadow-lg text-base-content"
              onClick={() => {
                item.action();
                if (!item.keepOpen) setOpen(false);
              }}
            >
              {item.icon}
            </button>
          </div>
        );
      })}
    </div>
  );
}
