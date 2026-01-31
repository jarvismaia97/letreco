import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Tile from './Tile';
import { TILE_GAP, MAX_ATTEMPTS } from '../theme';
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
  const { width, height } = useWindowDimensions();

  // Calculate tile size based on available space
  // Reserve: header ~50, mode selector ~50, keyboard ~210, padding ~40
  const availableHeight = height - 350;
  const availableWidth = width - 20;

  const maxTileFromWidth = Math.floor((availableWidth - (mode - 1) * TILE_GAP) / mode);
  const maxTileFromHeight = Math.floor((availableHeight - (MAX_ATTEMPTS - 1) * TILE_GAP) / MAX_ATTEMPTS);
  const tileSize = Math.min(maxTileFromWidth, maxTileFromHeight, 68);

  return (
    <View style={styles.container}>
      {board.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
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
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  row: {
    flexDirection: 'row',
  },
});
