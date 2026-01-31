import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import Header from './src/components/Header';
import ModeSelector from './src/components/ModeSelector';
import Board from './src/components/Board';
import Keyboard from './src/components/Keyboard';
import Toast from './src/components/Toast';
import StatsModal from './src/components/StatsModal';
import HelpModal from './src/components/HelpModal';
import { useGame } from './src/hooks/useGame';
import { COLORS } from './src/theme';

function GameScreen({ mode, onModeChange }: { mode: number; onModeChange: (m: number) => void }) {
  const [showHelp, setShowHelp] = useState(false);
  const game = useGame(mode);

  // Physical keyboard support (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        game.onKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        game.onKeyPress('BACKSPACE');
      } else if (/^[a-zA-ZçÇ]$/.test(e.key)) {
        game.onKeyPress(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [game.onKeyPress]);

  if (!game.loaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Header onHelp={() => setShowHelp(true)} onStats={() => game.setShowStats(true)} />
      <ModeSelector mode={mode} onSelect={onModeChange} />
      <View style={styles.boardContainer}>
        <Board
          board={game.board}
          mode={mode}
          revealingRow={game.revealingRow}
          currentRowIndex={game.currentRowIndex}
          cursorPosition={game.cursorPosition}
          onTilePress={(col) => game.setCursorPosition(col)}
        />
      </View>
      <Toast message={game.toastMessage} />
      <Keyboard onKeyPress={game.onKeyPress} keyColors={game.keyboardColors()} />
      <StatsModal
        visible={game.showStats}
        onClose={() => game.setShowStats(false)}
        stats={game.stats}
        gameOver={game.gameOver}
        won={game.won}
        answer={game.dailyWord}
        shareText={game.shareResult()}
      />
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
    </View>
  );
}

export default function App() {
  const [mode, setMode] = useState(5);

  // key={mode} forces full remount when switching modes
  return <GameScreen key={mode} mode={mode} onModeChange={setMode} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
