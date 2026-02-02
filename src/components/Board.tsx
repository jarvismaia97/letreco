import Tile from './Tile';
import { MAX_ATTEMPTS } from '../constants';
import type { TileData } from '../hooks/useGame';

interface Props {
  board: TileData[][];
  mode: number;
  revealingRow: number;
  currentRowIndex: number;
  cursorPosition: number;
  onTilePress: (col: number) => void;
}

export default function Board({ board, mode, revealingRow, currentRowIndex, cursorPosition, onTilePress }: Props) {
  const availableHeight = window.innerHeight - 350;
  const availableWidth = window.innerWidth - 20;
  const gap = 5;

  const maxFromW = Math.floor((availableWidth - (mode - 1) * gap) / mode);
  const maxFromH = Math.floor((availableHeight - (MAX_ATTEMPTS - 1) * gap) / MAX_ATTEMPTS);
  const tileSize = Math.min(maxFromW, maxFromH, 68);

  return (
    <div className="flex flex-col items-center py-1">
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="flex">
          {row.map((tile, colIdx) => (
            <Tile
              key={`${rowIdx}-${colIdx}`}
              letter={tile.letter}
              state={tile.state}
              size={tileSize}
              delay={colIdx * 250}
              revealing={rowIdx === revealingRow}
              isCursor={rowIdx === currentRowIndex && colIdx === cursorPosition}
              onPress={rowIdx === currentRowIndex ? () => onTilePress(colIdx) : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
