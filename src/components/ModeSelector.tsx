

interface ModeSelectorProps {
  mode: number;
  onSelect: (mode: number) => void;
}

const LETTER_MODES = [4, 5, 6, 7];

export default function ModeSelector({ mode, onSelect }: ModeSelectorProps) {
  return (
    <div className="letter-mode-selector">
      {LETTER_MODES.map((letterCount) => (
        <button
          key={letterCount}
          className={`letter-mode-button ${mode === letterCount ? 'active' : ''}`}
          onClick={() => onSelect(letterCount)}
        >
          {letterCount}
        </button>
      ))}
    </div>
  );
}