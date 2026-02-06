import { HelpCircle, Trophy } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  onHelp: () => void;
  onLeaderboard: () => void;
  rightElement?: ReactNode;
}

export default function Header({ onHelp, onLeaderboard, rightElement }: Props) {
  return (
    <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-base-300 w-full max-w-full overflow-visible">
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={onHelp}
          aria-label="Como jogar"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={onLeaderboard}
          aria-label="Ranking Global"
        >
          <Trophy className="w-5 h-5" />
        </button>
      </div>
      <img 
        src="/letreco-logo.png" 
        alt="Letreco" 
        className="h-10 sm:h-12 md:h-14 max-w-[40vw] object-contain select-none" 
      />
      <div className="flex-shrink-0">
        {rightElement || <div className="w-10" />}
      </div>
    </header>
  );
}
