import type { GameMode } from '../hooks/useGame';

interface GameModeSelectorProps {
  gameMode: GameMode;
  onSelect: (mode: GameMode) => void;
}

export default function GameModeSelector({ gameMode, onSelect }: GameModeSelectorProps) {
  return (
    <div className="game-mode-selector">
      <button
        className={`mode-button ${gameMode === 'daily' ? 'active' : ''}`}
        onClick={() => onSelect('daily')}
      >
        Palavra do Dia
      </button>
      <button
        className={`mode-button ${gameMode === 'practice' ? 'active' : ''}`}
        onClick={() => onSelect('practice')}
      >
        Treino
      </button>
    </div>
  );
}