
import type { LetterState } from '../hooks/useGame';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyColors: Record<string, LetterState>;
}

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export default function Keyboard({ onKeyPress, keyColors }: KeyboardProps) {
  const getKeyClass = (key: string) => {
    const classes = ['key'];
    
    if (key === 'ENTER' || key === 'BACKSPACE') {
      classes.push('wide');
    }
    
    const state = keyColors[key];
    if (state) {
      classes.push(state);
    }
    
    return classes.join(' ');
  };

  const getKeyContent = (key: string) => {
    if (key === 'BACKSPACE') {
      return '⌫';
    }
    return key;
  };

  const handleKeyClick = (key: string) => {
    onKeyPress(key);
  };

  return (
    <div className="keyboard">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => handleKeyClick(key)}
              type="button"
            >
              {getKeyContent(key)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}