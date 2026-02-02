
import type { LetterState } from '../hooks/useGame';

interface TileProps {
  letter: string;
  state: LetterState;
  size: number;
  delay?: number;
  revealing?: boolean;
  isCursor?: boolean;
  onPress?: () => void;
}

export default function Tile({ 
  letter, 
  state, 
  size, 
  delay = 0, 
  revealing = false, 
  isCursor = false, 
  onPress 
}: TileProps) {
  const fontSize = Math.max(size * 0.5, 16);
  
  const tileStyle = {
    width: size,
    height: size,
    fontSize,
    animationDelay: revealing ? `${delay}ms` : '0ms',
  };

  const classNames = [
    'tile',
    state,
    revealing && 'revealing',
    isCursor && 'cursor',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={tileStyle}
      onClick={onPress}
    >
      {letter}
    </div>
  );
}