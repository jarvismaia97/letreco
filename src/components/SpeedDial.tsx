import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, BarChart3, History, Play, Settings, User, LogIn } from 'lucide-react';
import type { GameMode } from '../hooks/useGame';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  themeMode: 'dark' | 'light';
  gameMode: GameMode;
  onToggleTheme: () => void;
  onStats: () => void;
  onHistory: () => void;
  onToggleGameMode: () => void;
  onLogin: () => void;
}

export default function SpeedDial({
  themeMode,
  gameMode,
  onToggleTheme,
  onStats,
  onHistory,
  onToggleGameMode,
  onLogin,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const displayName = user?.displayName || 'Jogador';

  const items = [
    { 
      icon: isAuthenticated ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />, 
      label: isAuthenticated ? displayName : 'Entrar', 
      action: onLogin, 
      isInfo: isAuthenticated 
    },
    { icon: themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />, label: themeMode === 'dark' ? 'Tema claro' : 'Tema escuro', action: onToggleTheme, keepOpen: true },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Estatísticas', action: onStats },
    { icon: <History className="w-5 h-5" />, label: 'Histórico', action: onHistory },
    { icon: <Play className="w-5 h-5" />, label: gameMode === 'daily' ? 'Treino' : 'Palavra do Dia', action: onToggleGameMode },
  ];

  return (
    <div ref={ref} className="relative z-40">
      {/* Main FAB */}
      <button
        className="btn btn-circle btn-primary shadow-xl relative z-10 transition-transform duration-200"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        <Settings className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>

      {/* Flower items - expand downward from FAB */}
      {items.map((item, i) => {
        // Stack items vertically below FAB
        const y = (i + 1) * 48;
        const isInfo = 'isInfo' in item && item.isInfo;

        return (
          <div
            key={i}
            className="absolute top-0 right-0 flex items-center gap-2"
            style={{
              transform: open
                ? `translate(0, ${y}px) scale(1)`
                : 'translate(0, 0) scale(0)',
              opacity: open ? 1 : 0,
              transition: `all 250ms cubic-bezier(0.34, 1.56, 0.64, 1) ${open ? i * 50 : 0}ms`,
            }}
          >
            {isInfo && (
              <span className="bg-base-200 px-3 py-1 rounded-full text-xs font-medium text-base-content shadow-lg whitespace-nowrap">
                {item.label}
              </span>
            )}
            <button
              className={`btn btn-circle btn-sm shadow-lg ${
                isInfo 
                  ? 'bg-primary text-primary-content border-primary cursor-default' 
                  : 'bg-base-200 hover:bg-base-300 border-base-300 text-base-content'
              }`}
              onClick={() => {
                if (!isInfo) {
                  item.action();
                  if (!('keepOpen' in item && item.keepOpen)) setOpen(false);
                }
              }}
              {...(!isInfo && { 'data-tip': item.label })}
            >
              {item.icon}
            </button>
          </div>
        );
      })}
    </div>
  );
}
