import Tile from './Tile';
import { TILE_GAP, MAX_ATTEMPTS } from '../theme';
import type { TileData } from '../hooks/useGame';

interface BoardProps {
  board: TileData[][];
  mode: number;
  revealingRow: number;
  currentRowIndex: number;
  cursorPosition: number;
  onTilePress: (col: number) => void;
}

export default function Board({ 
  board, 
  mode, 
  revealingRow, 
  currentRowIndex, 
  cursorPosition, 
  onTilePress 
}: BoardProps) {
  // Calculate tile size based on available space
  const calculateTileSize = () => {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    // Reserve space for: header ~60px, mode selectors ~100px, keyboard ~200px, padding ~40px
    const availableHeight = vh - 400;
    const availableWidth = vw - 32; // 16px padding on each side
    
    const maxTileFromWidth = Math.floor((availableWidth - (mode - 1) * TILE_GAP) / mode);
    const maxTileFromHeight = Math.floor((availableHeight - (MAX_ATTEMPTS - 1) * TILE_GAP) / MAX_ATTEMPTS);
    
    // Clamp between reasonable bounds
    return Math.min(maxTileFromWidth, maxTileFromHeight, 68, Math.max(45, Math.min(vw / mode * 0.8, vh / MAX_ATTEMPTS * 0.6)));
  };

  const tileSize = calculateTileSize();

  const boardStyle = {
    gridTemplateColumns: `repeat(${mode}, ${tileSize}px)`,
    gap: `${TILE_GAP}px`,
  };

  const rowStyle = {
    gridTemplateColumns: `repeat(${mode}, ${tileSize}px)`,
    gap: `${TILE_GAP}px`,
  };

  return (
    <div className="board-container">
      <div className="board" style={boardStyle}>
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="board-row" style={rowStyle}>
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
    </div>
  );
}