import type { LetterState } from '../hooks/useGame';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

interface Props {
  onKeyPress: (key: string) => void;
  keyColors: Record<string, LetterState>;
}

function keyBg(state: LetterState | undefined): string {
  switch (state) {
    case 'correct': return 'bg-[var(--color-correct)]';
    case 'present': return 'bg-[var(--color-present)]';
    case 'absent': return 'bg-[var(--color-absent)]';
    default: return 'bg-[var(--color-key-bg)]';
  }
}

export default function Keyboard({ onKeyPress, keyColors }: Props) {
  const keyWidth = Math.min(Math.floor((window.innerWidth - 30) / 10), 44);
  const keyHeight = Math.min(58, Math.floor(window.innerHeight * 0.065));

  return (
    <div className="flex flex-col items-center pb-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex my-[3px]">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === '⌫';
            const display = key === '⌫' ? '⌫' : key;
            const bg = isSpecial ? 'bg-[var(--color-key-bg)]' : keyBg(keyColors[key]);
            const w = isSpecial ? keyWidth * 1.5 : keyWidth;

            return (
              <button
                key={key}
                className={`
                  ${bg} text-white font-bold rounded mx-[2.5px]
                  flex items-center justify-center select-none
                  active:opacity-70 transition-opacity
                  ${isSpecial ? 'text-xs' : 'text-base'}
                `}
                style={{ width: w, height: keyHeight }}
                onClick={() => onKeyPress(key === '⌫' ? 'BACKSPACE' : key)}
              >
                {display}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
