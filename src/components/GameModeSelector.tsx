import type { GameMode } from '../hooks/useGame';

interface Props {
  gameMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export default function GameModeSelector({ gameMode, onSelect }: Props) {
  return (
    <div className="flex justify-center gap-3 py-2 mb-1">
      <button
        className={`btn btn-sm rounded-full min-w-[130px] ${
          gameMode === 'daily'
            ? 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white hover:bg-[var(--color-correct)]'
            : 'btn-outline border-base-content/30 text-base-content/60'
        }`}
        onClick={() => onSelect('daily')}
      >
        🔥 Palavra do Dia
      </button>
      <button
        className={`btn btn-sm rounded-full min-w-[100px] ${
          gameMode === 'practice'
            ? 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white hover:bg-[var(--color-correct)]'
            : 'btn-outline border-base-content/30 text-base-content/60'
        }`}
        onClick={() => onSelect('practice')}
      >
        Prática
      </button>
    </div>
  );
}
