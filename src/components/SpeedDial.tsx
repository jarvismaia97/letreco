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

/* SVG icons */
const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14M5 3v4a7 7 0 007 7m-7-11H2m3 0h14m0 0h3m-3 0v4a7 7 0 01-7 7m0 0v4m0-4h-4m4 0h4m-8 4h8" />
  </svg>
);

const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Flower positions: arranged in an arc from bottom-right
// Each item gets angle-based positioning relative to the FAB
const FLOWER_POSITIONS = [
  { x: -60, y: 0 },    // left
  { x: -50, y: -40 },  // upper-left
  { x: -25, y: -60 },  // upper
  { x: 5, y: -60 },    // upper-right-ish
  { x: -55, y: 45 },   // lower-left
];

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
    { icon: <HelpIcon />, label: 'Como jogar', action: onHelp },
    { icon: themeMode === 'dark' ? <SunIcon /> : <MoonIcon />, label: themeMode === 'dark' ? 'Tema claro' : 'Tema escuro', action: onToggleTheme, keepOpen: true },
    { icon: <ChartIcon />, label: 'Estatísticas', action: onStats },
    { icon: <TrophyIcon />, label: 'Leaderboard', action: onLeaderboard },
    { icon: <GamepadIcon />, label: gameMode === 'daily' ? 'Treino' : 'Palavra do Dia', action: onToggleGameMode },
  ];

  return (
    <div ref={ref} className="fixed top-4 right-4 z-40" style={{ width: 120, height: 120 }}>
      {/* Flower items */}
      {items.map((item, i) => {
        const pos = FLOWER_POSITIONS[i];
        return (
          <div
            key={i}
            className="absolute tooltip tooltip-left"
            data-tip={item.label}
            style={{
              right: 4,
              top: 4,
              transform: open
                ? `translate(${pos.x}px, ${pos.y}px) scale(1)`
                : 'translate(0, 0) scale(0)',
              opacity: open ? 1 : 0,
              transition: `all 200ms cubic-bezier(0.4, 0, 0.2, 1) ${open ? i * 40 : 0}ms`,
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

      {/* Main FAB button */}
      <button
        className={`btn btn-circle btn-primary shadow-xl absolute right-0 top-0 z-10 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
}
