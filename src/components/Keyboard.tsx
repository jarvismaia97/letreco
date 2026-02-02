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
  return (
    <div className="w-full px-1 pb-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex w-full my-[3px] gap-[3px]">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === '⌫';
            const display = key === '⌫' ? '⌫' : key;
            const bg = isSpecial ? 'bg-[var(--color-key-bg)]' : keyBg(keyColors[key]);

            return (
              <button
                key={key}
                className={`
                  ${bg} text-white font-bold rounded
                  flex items-center justify-center select-none
                  active:opacity-70 transition-opacity
                  h-14
                  ${isSpecial ? 'flex-[1.5] text-xs' : 'flex-1 text-base'}
                `}
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
