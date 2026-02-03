import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, BarChart3, History, Play, Plus } from 'lucide-react';
import type { GameMode } from '../hooks/useGame';

interface Props {
  themeMode: 'dark' | 'light';
  gameMode: GameMode;
  onToggleTheme: () => void;
  onStats: () => void;
  onHistory: () => void;
  onToggleGameMode: () => void;
}

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
    { icon: themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />, label: themeMode === 'dark' ? 'Tema claro' : 'Tema escuro', action: onToggleTheme, keepOpen: true },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Estatísticas', action: onStats },
    { icon: <History className="w-5 h-5" />, label: 'Histórico', action: onHistory },
    { icon: <Play className="w-5 h-5" />, label: gameMode === 'daily' ? 'Treino' : 'Palavra do Dia', action: onToggleGameMode },
  ];

  return (
    <div ref={ref} className="fixed bottom-24 right-4 z-40">
      {/* Main FAB */}
      <button
        className="btn btn-circle btn-primary shadow-xl relative z-10 transition-transform duration-200"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <Plus className={`w-6 h-6 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
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
