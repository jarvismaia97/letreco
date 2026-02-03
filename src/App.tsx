import { useState, useEffect } from 'react';
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
  const [lastSavedGame, setLastSavedGame] = useState('');

  // Initialize anonymous auth and migrate local stats
  useEffect(() => {
    ensurePlayer().then(() => migrateLocalStats()).catch(() => {});
  }, []);

  // Save game result to Supabase when game ends
  useEffect(() => {
    if (!game.gameOver || !game.loaded) return;
    const gameKey = `${letterMode}-${gameMode}-${game.targetWord}-${game.guesses.length}`;
    if (gameKey === lastSavedGame) return;
    setLastSavedGame(gameKey);

    const today = new Date();
    const dailyDate = gameMode === 'daily'
      ? `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
      : undefined;

    saveGameResult({
      letterMode,
      gameMode,
      word: game.targetWord,
      attempts: game.guesses.length,
      won: game.won,
      board: game.guesses,
      dailyDate,
    }).catch(() => {});
  }, [game.gameOver, game.loaded, letterMode, gameMode, game.targetWord, game.guesses, game.won, lastSavedGame]);

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
      <div className="flex items-center justify-center px-2 py-2">
        <div className="flex-1" />
        <ModeSelector mode={letterMode} onSelect={onLetterModeChange} />
        <div className="flex-1 flex justify-end pr-1">
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
          onTilePress={(col) => game.setCursorPosition(col)}
        />
      </div>
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
      <HelpModal visible={showHelp} onClose={closeHelp} />
      <LeaderboardModal visible={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <HistoryModal visible={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}

export default function App() {
  const [letterMode, setLetterMode] = useState(5);
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [modeToastGlobal, setModeToastGlobal] = useState('');

  return (
    <>
      <GameScreen
        key={`${letterMode}-${gameMode}`}
        letterMode={letterMode}
        gameMode={gameMode}
        onLetterModeChange={setLetterMode}
        onGameModeChange={(m) => {
          setGameMode(m);
          setModeToastGlobal(m === 'daily' ? '☀️ Modo Palavra do Dia ativado' : '🔄 Modo Treino ativado');
          setTimeout(() => setModeToastGlobal(''), 2500);
        }}
      />
      {modeToastGlobal && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-toast">
          <div className="bg-base-content text-base-100 px-5 py-3 rounded-lg font-bold text-sm shadow-lg">
            {modeToastGlobal}
          </div>
        </div>
      )}
    </>
  );
}
