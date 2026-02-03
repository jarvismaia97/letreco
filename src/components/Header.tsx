import { HelpCircle, Trophy } from 'lucide-react';

interface Props {
  onHelp: () => void;
  onLeaderboard: () => void;
}

export default function Header({ onHelp, onLeaderboard }: Props) {
  return (
    <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-base-300 w-full max-w-full overflow-hidden">
      <button
        className="btn btn-circle btn-ghost btn-sm flex-shrink-0"
        onClick={onHelp}
        aria-label="Como jogar"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <img 
        src="/letreco-logo.png" 
        alt="Letreco" 
        className="h-10 sm:h-12 md:h-14 max-w-[60vw] object-contain select-none" 
      />
      <button
        className="btn btn-circle btn-ghost btn-sm flex-shrink-0"
        onClick={onLeaderboard}
        aria-label="Ranking Global"
      >
        <Trophy className="w-5 h-5" />
      </button>
    </header>
  );
}
