import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import Header from './src/components/Header';
import ModeSelector from './src/components/ModeSelector';
import GameModeSelector from './src/components/GameModeSelector';
import Board from './src/components/Board';
import Keyboard from './src/components/Keyboard';
import Toast from './src/components/Toast';
import StatsModal from './src/components/StatsModal';
import HelpModal from './src/components/HelpModal';
import { useGame, GameMode } from './src/hooks/useGame';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

function GameScreen({ 
  letterMode, 
  gameMode, 
  onLetterModeChange, 
  onGameModeChange 
}: { 
  letterMode: number; 
  gameMode: GameMode;
  onLetterModeChange: (m: number) => void;
  onGameModeChange: (m: GameMode) => void;
}) {
  const { theme } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const game = useGame(letterMode, gameMode);

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

  if (!game.loaded) return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={theme.name === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background} 
      />
      <Header onHelp={() => setShowHelp(true)} onStats={() => game.setShowStats(true)} />
      <GameModeSelector gameMode={gameMode} onSelect={onGameModeChange} />
      <ModeSelector mode={letterMode} onSelect={onLetterModeChange} />
      <View style={styles.boardContainer}>
        <Board
          board={game.board}
          mode={letterMode}
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
        answer={game.targetWord}
        shareText={game.shareResult()}
        gameMode={gameMode}
      />
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
    </SafeAreaView>
  );
}

function AppContent() {
  const { isLoading } = useTheme();
  const [letterMode, setLetterMode] = useState(5);
  const [gameMode, setGameMode] = useState<GameMode>('daily'); // Default to daily mode

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  // key combines both modes to force full remount when switching
  return (
    <GameScreen 
      key={`${letterMode}-${gameMode}`} 
      letterMode={letterMode}
      gameMode={gameMode}
      onLetterModeChange={setLetterMode}
      onGameModeChange={setGameMode}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    backgroundColor: '#121213', // Default dark background for loading
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
