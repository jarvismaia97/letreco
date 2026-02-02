import { useEffect, useRef, useState } from 'react';
import type { LetterState } from '../hooks/useGame';

interface Props {
  letter: string;
  state: LetterState;
  size: number;
  delay?: number;
  revealing?: boolean;
  isCursor?: boolean;
  onPress?: () => void;
}

function bgClass(state: LetterState): string {
  switch (state) {
    case 'correct': return 'bg-[var(--color-correct)]';
    case 'present': return 'bg-[var(--color-present)]';
    case 'absent': return 'bg-[var(--color-absent)]';
    default: return '';
  }
}

export default function Tile({ letter, state, size, delay = 0, revealing, isCursor, onPress }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [pop, setPop] = useState(false);
  const prevState = useRef(state);

  useEffect(() => {
    if (revealing && (state === 'correct' || state === 'present' || state === 'absent')) {
      const timer = setTimeout(() => setFlipped(true), delay);
      return () => clearTimeout(timer);
    }
  }, [revealing, state, delay]);

  useEffect(() => {
    if (letter && state === 'tbd' && prevState.current === 'empty') {
      setPop(true);
      const t = setTimeout(() => setPop(false), 100);
      prevState.current = state;
      return () => clearTimeout(t);
    }
    prevState.current = state;
  }, [letter, state]);

  const isRevealed = state === 'correct' || state === 'present' || state === 'absent';
  const showBg = isRevealed && (!revealing || flipped);

  const borderStyle = isCursor
    ? 'border-2.5 border-base-content shadow-[0_0_6px_rgba(255,255,255,0.4)]'
    : isRevealed
      ? 'border-0'
      : state === 'tbd'
        ? 'border-2 border-[var(--color-empty-border)]'
        : 'border-2 border-base-300';

  return (
    <div
      className={`
        flex items-center justify-center font-bold select-none
        ${borderStyle}
        ${showBg ? bgClass(state) : ''}
        ${revealing && flipped ? 'animate-flip' : ''}
        ${pop ? 'animate-pop' : ''}
        ${onPress ? 'cursor-pointer' : ''}
      `}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        margin: 2.5,
        transition: 'background-color 0.1s',
      }}
      onClick={onPress}
    >
      <span className="text-white">{letter}</span>
    </div>
  );
}
