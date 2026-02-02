interface Props {
  themeMode: 'dark' | 'light';
  onHelp: () => void;
  onStats: () => void;
  onToggleTheme: () => void;
}

export default function Header({ themeMode, onHelp, onStats, onToggleTheme }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-base-300">
      <button
        className="btn btn-circle btn-ghost btn-sm text-lg"
        onClick={onHelp}
        aria-label="Como jogar"
      >
        ?
      </button>
      <img src="/letreco-logo.jpg" alt="Letreco" className="h-8 md:h-10 select-none" />
      <div className="flex gap-1">
        <button
          className="btn btn-circle btn-ghost btn-sm text-lg"
          onClick={onToggleTheme}
          aria-label="Mudar tema"
        >
          {themeMode === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          className="btn btn-circle btn-ghost btn-sm text-lg"
          onClick={onStats}
          aria-label="Estatísticas"
        >
          📊
        </button>
      </div>
    </header>
  );
}
