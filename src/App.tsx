import { useState, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import GameModeSelector from './components/GameModeSelector';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import Toast from './components/Toast';
import StatsModal from './components/StatsModal';
import HelpModal from './components/HelpModal';
import { useGame, type GameMode } from './hooks/useGame';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

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
  const { isLoading } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const game = useGame(letterMode, gameMode);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      if (e.key === 'Enter') {
        e.preventDefault();
        game.onKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        game.onKeyPress('BACKSPACE');
      } else if (/^[a-zA-ZçÇ]$/.test(e.key)) {
        e.preventDefault();
        game.onKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.onKeyPress]);

  if (isLoading || !game.loaded) {
    return (
      <div className="container" style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'var(--color-background)' 
      }}>
        <div style={{ fontSize: '24px', color: 'var(--color-text)' }}>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header onHelp={() => setShowHelp(true)} onStats={() => game.setShowStats(true)} />
      <GameModeSelector gameMode={gameMode} onSelect={onGameModeChange} />
      <ModeSelector mode={letterMode} onSelect={onLetterModeChange} />
      <Board
        board={game.board}
        mode={letterMode}
        revealingRow={game.revealingRow}
        currentRowIndex={game.currentRowIndex}
        cursorPosition={game.cursorPosition}
        onTilePress={(col) => game.setCursorPosition(col)}
      />
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
    </div>
  );
}

function AppContent() {
  const [letterMode, setLetterMode] = useState(5);
  const [gameMode, setGameMode] = useState<GameMode>('daily'); // Default to daily mode

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