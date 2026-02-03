import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import Toast from './components/Toast';
import StatsModal from './components/StatsModal';
import HelpModal from './components/HelpModal';
import LeaderboardModal from './components/LeaderboardModal';
import HistoryModal from './components/HistoryModal';
import SpeedDial from './components/SpeedDial';
import { useGame, type GameMode } from './hooks/useGame';
import { useTheme } from './hooks/useTheme';
import { ensurePlayer, migrateLocalStats, saveGameResult } from './lib/auth';
import { isSupabaseConfigured } from './lib/supabase';

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
  const [showHistory, setShowHistory] = useState(false);
  const [modeToast, setModeToast] = useState('');
  const gameResultSavedRef = useRef(false);

  const [showHelp, setShowHelp] = useState(() => {
    return !localStorage.getItem(HELP_SEEN_KEY);
  });

  const closeHelp = () => {
    setShowHelp(false);
    localStorage.setItem(HELP_SEEN_KEY, '1');
  };

  // Initialize player on mount
  useEffect(() => {
    if (isSupabaseConfigured()) {
      ensurePlayer().then(() => {
        migrateLocalStats();
      });
    }
  }, []);

  // Save game result when game ends
  useEffect(() => {
    if (game.gameOver && !gameResultSavedRef.current && isSupabaseConfigured()) {
      gameResultSavedRef.current = true;
      
      // Get daily date for daily mode
      const today = new Date();
      const dailyDate = gameMode === 'daily' 
        ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        : undefined;

      saveGameResult({
        letterMode,
        gameMode,
        word: game.targetWord,
        attempts: game.currentRowIndex + 1,
        won: game.won,
        board: game.board,
        dailyDate,
      });
    }
  }, [game.gameOver, game.won, game.targetWord, game.currentRowIndex, game.board, letterMode, gameMode]);

  // Reset saved flag when game changes
  useEffect(() => {
    gameResultSavedRef.current = false;
  }, [letterMode, gameMode]);

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
    <div className="min-h-dvh bg-base-100 flex flex-col max-w-lg mx-auto relative w-full overflow-x-hidden">
      <Header onHelp={() => setShowHelp(true)} onLeaderboard={() => setShowLeaderboard(true)} />
      <div className="flex items-center justify-between px-4 py-2 gap-3">
        <div className="w-10 flex-shrink-0" /> {/* Spacer for balance */}
        <ModeSelector mode={letterMode} onSelect={onLetterModeChange} />
        <div className="flex-shrink-0">
          <SpeedDial
        themeMode={themeMode}
        gameMode={gameMode}
        onToggleTheme={toggleTheme}
        onStats={() => game.setShowStats(true)}
        onHistory={() => setShowHistory(true)}
        onToggleGameMode={() => {
          const next = gameMode === 'daily' ? 'practice' : 'daily';
          onGameModeChange(next);
          setModeToast(next === 'daily' ? '☀️ Modo Palavra do Dia ativado' : '🔄 Modo Treino ativado');
          setTimeout(() => setModeToast(''), 2000);
        }}
      />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Board
          board={game.board}
          mode={letterMode}
          revealingRow={game.revealingRow}
          currentRowIndex={game.currentRowIndex}
          cursorPosition={game.cursorPosition}
          won={game.won}
          onTilePress={(col) => game.setCursorPosition(col)}
        />
      </div>
      <Toast message={modeToast || game.toastMessage} />
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
        board={game.board}
        letterMode={letterMode}
      />
      <HelpModal visible={showHelp} onClose={closeHelp} />
      <LeaderboardModal visible={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <HistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
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
