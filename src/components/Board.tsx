import React from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from './Tile';
import { TILE_SIZES } from '../theme';
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
  const tileSize = TILE_SIZES[mode] || 62;

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
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
});
