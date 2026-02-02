import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnswers, getValidWords } from '../data/words';
import { getDailyWord, getDayNumber } from '../utils/daily';
import { normalize } from '../utils/accents';
import { MAX_ATTEMPTS } from '../theme';

export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
export type GameMode = 'daily' | 'practice';

export interface TileData {
  letter: string;
  state: LetterState;
}

export interface GameStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[]; // index 0 = won in 1 guess, etc.
  lastPlayedDay?: number;
}

const DEFAULT_STATS: GameStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
  lastPlayedDay: 0,
};

function evaluateGuess(guess: string, answer: string): LetterState[] {
  const normGuess = normalize(guess);
  const normAnswer = normalize(answer);
  const len = normAnswer.length;
  const result: LetterState[] = new Array(len).fill('absent');
  const answerCounts: Record<string, number> = {};

  // Count letters in answer
  for (const ch of normAnswer) {
    answerCounts[ch] = (answerCounts[ch] || 0) + 1;
  }

  // First pass: correct positions
  for (let i = 0; i < len; i++) {
    if (normGuess[i] === normAnswer[i]) {
      result[i] = 'correct';
      answerCounts[normGuess[i]]--;
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < len; i++) {
    if (result[i] !== 'correct' && answerCounts[normGuess[i]] > 0) {
      result[i] = 'present';
      answerCounts[normGuess[i]]--;
    }
  }

  return result;
}

export function useGame(letterMode: number, gameMode: GameMode = 'daily') {
  const answers = getAnswers(letterMode);
  const validWords = getValidWords(letterMode);
  const dayNumber = getDayNumber();
  
  // For practice mode, pick a random word; for daily mode, use the daily word
  const targetWord = gameMode === 'daily' 
    ? getDailyWord(answers, letterMode)
    : answers[Math.floor(Math.random() * answers.length)];

  const [guesses, setGuesses] = useState<TileData[][]>([]);
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [revealingRow, setRevealingRow] = useState(-1);
  const [showStats, setShowStats] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset state when letterMode or gameMode changes
  useEffect(() => {
    setGuesses([]);
    setCurrentInput([]);
    setCursorPosition(0);
    setGameOver(false);
    setWon(false);
    setRevealingRow(-1);
    setShowStats(false);
    setLoaded(false);
  }, [letterMode, gameMode]);

  // Load saved state
  useEffect(() => {
    (async () => {
      try {
        // Stats are shared between game modes but separate by letter count
        const savedStats = await AsyncStorage.getItem(`letreco_stats_${letterMode}`);
        if (savedStats) {
          const stats = JSON.parse(savedStats);
          // Check for streak reset for daily mode only
          if (gameMode === 'daily' && stats.lastPlayedDay && dayNumber - stats.lastPlayedDay > 1) {
            stats.currentStreak = 0;
          }
          setStats(stats);
        }

        // Only load saved state for daily mode
        if (gameMode === 'daily') {
          const savedState = await AsyncStorage.getItem(`letreco_state_${letterMode}_daily_${dayNumber}`);
          if (savedState) {
            const state = JSON.parse(savedState);
            setGuesses(state.guesses || []);
            setGameOver(state.gameOver || false);
            setWon(state.won || false);
          }
        }
      } catch {}
      setLoaded(true);
    })();
  }, [letterMode, gameMode, dayNumber]);

  // Save state (only for daily mode)
  const saveState = useCallback(async (g: TileData[][], over: boolean, w: boolean) => {
    if (gameMode === 'daily') {
      try {
        await AsyncStorage.setItem(
          `letreco_state_${letterMode}_daily_${dayNumber}`,
          JSON.stringify({ guesses: g, gameOver: over, won: w })
        );
      } catch {}
    }
  }, [letterMode, gameMode, dayNumber]);

  const saveStats = useCallback(async (s: GameStats) => {
    try {
      await AsyncStorage.setItem(`letreco_stats_${letterMode}`, JSON.stringify(s));
    } catch {}
  }, [letterMode]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  }, []);

  const onKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      // Check all slots are filled
      const filled = currentInput.filter(c => c !== '');
      if (filled.length !== letterMode) {
        showToast(`A palavra deve ter ${letterMode} letras`);
        return;
      }
      const word = currentInput.join('');
      const normalized = normalize(word);
      if (!validWords.has(normalized)) {
        showToast('Palavra não encontrada');
        return;
      }
      const states = evaluateGuess(word, targetWord);
      const row: TileData[] = currentInput.map((letter, i) => ({
        letter: letter.toUpperCase(),
        state: states[i],
      }));

      const newGuesses = [...guesses, row];
      setRevealingRow(guesses.length);
      setTimeout(() => setRevealingRow(-1), letterMode * 300 + 200);

      const isWin = states.every((s) => s === 'correct');
      const isLoss = !isWin && newGuesses.length >= MAX_ATTEMPTS;
      const over = isWin || isLoss;

      setGuesses(newGuesses);
      setCurrentInput([]);
      setCursorPosition(0);

      if (over) {
        setTimeout(() => {
          setGameOver(true);
          setWon(isWin);
          
          // Only update stats for daily mode to track streaks properly
          if (gameMode === 'daily') {
            const newStats = { ...stats, played: stats.played + 1, lastPlayedDay: dayNumber };
            if (isWin) {
              newStats.wins = stats.wins + 1;
              newStats.currentStreak = stats.currentStreak + 1;
              newStats.maxStreak = Math.max(newStats.currentStreak, stats.maxStreak);
              newStats.distribution = [...stats.distribution];
              newStats.distribution[newGuesses.length - 1]++;
            } else {
              newStats.currentStreak = 0;
            }
            setStats(newStats);
            saveStats(newStats);
          }
          setShowStats(true);
        }, letterMode * 300 + 500);
      }

      saveState(newGuesses, over, isWin);
    } else if (key === 'BACKSPACE') {
      setCurrentInput((prev) => {
        const chars = [...prev];
        // Ensure array is right size
        while (chars.length < letterMode) chars.push('');

        if (chars[cursorPosition] && chars[cursorPosition] !== '') {
          // Clear letter at cursor position
          chars[cursorPosition] = '';
          return chars;
        } else if (cursorPosition > 0) {
          // Move back to previous position and clear it
          const newPos = cursorPosition - 1;
          chars[newPos] = '';
          setCursorPosition(newPos);
          return chars;
        }
        return prev;
      });
    } else {
      // Letter key
      setCurrentInput((prev) => {
        const chars = [...prev];
        // Ensure array is right size
        while (chars.length < letterMode) chars.push('');

        // Place letter at cursor position
        chars[cursorPosition] = key.toUpperCase();

        // Advance cursor to next empty spot
        let nextPos = cursorPosition + 1;
        while (nextPos < letterMode && chars[nextPos] && chars[nextPos] !== '') {
          nextPos++;
        }
        if (nextPos >= letterMode) {
          // If no empty spot after, find first empty from start
          for (let i = 0; i < letterMode; i++) {
            if (!chars[i] || chars[i] === '') {
              nextPos = i;
              break;
            }
          }
        }
        setCursorPosition(Math.min(nextPos, letterMode - 1));
        return chars;
      });
    }
  }, [gameOver, currentInput, cursorPosition, letterMode, gameMode, validWords, targetWord, guesses, stats, dayNumber, saveState, saveStats, showToast]);

  // Keyboard colors
  const keyboardColors = useCallback((): Record<string, LetterState> => {
    const colors: Record<string, LetterState> = {};
    for (const row of guesses) {
      for (const tile of row) {
        const normLetter = normalize(tile.letter);
        const existing = colors[normLetter];
        if (tile.state === 'correct') {
          colors[normLetter] = 'correct';
        } else if (tile.state === 'present' && existing !== 'correct') {
          colors[normLetter] = 'present';
        } else if (tile.state === 'absent' && !existing) {
          colors[normLetter] = 'absent';
        }
      }
    }
    return colors;
  }, [guesses]);

  // Share
  const shareResult = useCallback((): string => {
    if (gameMode === 'practice') return '';
    
    const emojiMap: Record<string, string> = {
      correct: '🟩',
      present: '🟨',
      absent: '⬛',
    };
    const grid = guesses
      .map((row) => row.map((t) => emojiMap[t.state] || '⬛').join(''))
      .join('\n');
    const result = won ? `${guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    return `Letreco ${dayNumber} (${letterMode} letras) ${result} ⭐\n${dateStr}\n\n${grid}`;
  }, [guesses, won, dayNumber, letterMode, gameMode]);

  // Build board data
  const board: TileData[][] = [];
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (i < guesses.length) {
      board.push(guesses[i]);
    } else if (i === guesses.length && !gameOver) {
      // Current input row
      const row: TileData[] = [];
      for (let j = 0; j < letterMode; j++) {
        const ch = currentInput[j] || '';
        row.push({
          letter: ch.toUpperCase(),
          state: ch ? 'tbd' : 'empty',
        });
      }
      board.push(row);
    } else {
      board.push(Array.from({ length: letterMode }, () => ({ letter: '', state: 'empty' as LetterState })));
    }
  }

  return {
    board,
    guesses,
    currentRowIndex: guesses.length,
    cursorPosition,
    setCursorPosition,
    gameOver,
    won,
    targetWord,
    toastMessage,
    stats,
    revealingRow,
    showStats,
    setShowStats,
    onKeyPress,
    keyboardColors,
    shareResult,
    loaded,
    gameMode,
  };
}
