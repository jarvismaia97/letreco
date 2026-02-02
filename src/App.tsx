import { useState, useEffect } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import Toast from './components/Toast';
import StatsModal from './components/StatsModal';
import HelpModal from './components/HelpModal';
import LeaderboardModal from './components/LeaderboardModal';
import SpeedDial from './components/SpeedDial';
import { useGame, type GameMode } from './hooks/useGame';
import { useTheme } from './hooks/useTheme';

const HELP_SEEN_KEY = 'letreco_help_seen';

function GameScreen({
  letterMode,
  gameMode,
  onLetterModeChange,
  onGameModeChange,
}: {
  letterMode: number;
  gameMode: GameMode;
  onLetterModeChange: (m: number) => void;
  onGameModeChange: (m: GameMode) => void;
}) {
  const { themeMode, toggleTheme } = useTheme();
  const game = useGame(letterMode, gameMode);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [modeToast, setModeToast] = useState('');

  const [showHelp, setShowHelp] = useState(() => {
    return !localStorage.getItem(HELP_SEEN_KEY);
  });

  const closeHelp = () => {
    setShowHelp(false);
    localStorage.setItem(HELP_SEEN_KEY, '1');
  };

  useEffect(() => {
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

  if (!game.loaded) {
    return <div className="min-h-dvh bg-base-100" />;
  }

  return (
    <div className="min-h-dvh bg-base-100 flex flex-col max-w-lg mx-auto relative w-full">
      <Header />
      <ModeSelector mode={letterMode} onSelect={onLetterModeChange} />

      <SpeedDial
        themeMode={themeMode}
        gameMode={gameMode}
        onHelp={() => setShowHelp(true)}
        onToggleTheme={toggleTheme}
        onStats={() => game.setShowStats(true)}
        onLeaderboard={() => setShowLeaderboard(true)}
        onToggleGameMode={() => {
          const next = gameMode === 'daily' ? 'practice' : 'daily';
          onGameModeChange(next);
          setModeToast(next === 'daily' ? '☀️ Modo Palavra do Dia ativado' : '🔄 Modo Treino ativado');
          setTimeout(() => setModeToast(''), 2000);
        }}
      />

      <div className="flex-1 flex items-center justify-center">
        <Board
          board={game.board}
          mode={letterMode}
          revealingRow={game.revealingRow}
          currentRowIndex={game.currentRowIndex}
          cursorPosition={game.cursorPosition}
          onTilePress={(col) => game.setCursorPosition(col)}
        />
      </div>
      <Toast message={game.toastMessage || modeToast} />
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
      <HelpModal visible={showHelp} onClose={closeHelp} />
      <LeaderboardModal visible={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
}

export default function App() {
  const [letterMode, setLetterMode] = useState(5);
  const [gameMode, setGameMode] = useState<GameMode>('daily');

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
