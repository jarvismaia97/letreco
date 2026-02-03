interface Props {
  onHelp: () => void;
  onLeaderboard: () => void;
}

export default function Header({ onHelp, onLeaderboard }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-base-300">
      <button
        className="btn btn-circle btn-ghost btn-sm text-lg"
        onClick={onHelp}
        aria-label="Como jogar"
      >
        ?
      </button>
      <img src="/letreco-logo.png" alt="Letreco" className="h-12 md:h-14 select-none" />
      <button
        className="btn btn-circle btn-ghost btn-sm text-lg"
        onClick={onLeaderboard}
        aria-label="Ranking Global"
      >
        🏆
      </button>
    </header>
  );
}
