import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnswers, getValidWords } from '../data/words';
import { getDailyWord, getDayNumber } from '../utils/daily';
import { normalize } from '../utils/accents';
import { MAX_ATTEMPTS } from '../theme';

export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

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
}

const DEFAULT_STATS: GameStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
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

export function useGame(mode: number) {
  const answers = getAnswers(mode);
  const validWords = getValidWords(mode);
  const dailyWord = getDailyWord(answers, mode);
  const dayNumber = getDayNumber();

  const [guesses, setGuesses] = useState<TileData[][]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [revealingRow, setRevealingRow] = useState(-1);
  const [showStats, setShowStats] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved state
  useEffect(() => {
    (async () => {
      try {
        const savedStats = await AsyncStorage.getItem(`letreco_stats_${mode}`);
        if (savedStats) setStats(JSON.parse(savedStats));

        const savedState = await AsyncStorage.getItem(`letreco_state_${mode}_${dayNumber}`);
        if (savedState) {
          const state = JSON.parse(savedState);
          setGuesses(state.guesses || []);
          setGameOver(state.gameOver || false);
          setWon(state.won || false);
        }
      } catch {}
      setLoaded(true);
    })();
  }, [mode, dayNumber]);

  // Save state
  const saveState = useCallback(async (g: TileData[][], over: boolean, w: boolean) => {
    try {
      await AsyncStorage.setItem(
        `letreco_state_${mode}_${dayNumber}`,
        JSON.stringify({ guesses: g, gameOver: over, won: w })
      );
    } catch {}
  }, [mode, dayNumber]);

  const saveStats = useCallback(async (s: GameStats) => {
    try {
      await AsyncStorage.setItem(`letreco_stats_${mode}`, JSON.stringify(s));
    } catch {}
  }, [mode]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  }, []);

  const onKeyPress = useCallback((key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') {
      if (currentInput.length !== mode) {
        showToast(`A palavra deve ter ${mode} letras`);
        return;
      }
      const normalized = normalize(currentInput);
      if (!validWords.has(normalized)) {
        showToast('Palavra não encontrada');
        return;
      }
      const states = evaluateGuess(currentInput, dailyWord);
      const row: TileData[] = currentInput.split('').map((letter, i) => ({
        letter: letter.toUpperCase(),
        state: states[i],
      }));

      const newGuesses = [...guesses, row];
      setRevealingRow(guesses.length);
      setTimeout(() => setRevealingRow(-1), mode * 300 + 200);

      const isWin = states.every((s) => s === 'correct');
      const isLoss = !isWin && newGuesses.length >= MAX_ATTEMPTS;
      const over = isWin || isLoss;

      setGuesses(newGuesses);
      setCurrentInput('');
      setCursorPosition(0);

      if (over) {
        setTimeout(() => {
          setGameOver(true);
          setWon(isWin);
          // Update stats
          const newStats = { ...stats, played: stats.played + 1 };
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
          setShowStats(true);
        }, mode * 300 + 500);
      }

      saveState(newGuesses, over, isWin);
    } else if (key === 'BACKSPACE') {
      // If cursor is on a filled tile, remove that letter
      // If cursor is on empty tile, move back and remove previous letter
      setCurrentInput((prev) => {
        const chars = prev.split('');
        if (cursorPosition < chars.length && chars[cursorPosition]) {
          chars.splice(cursorPosition, 1);
          // Don't move cursor back, it now points to the next char (or empty)
          return chars.join('');
        } else if (cursorPosition > 0) {
          const newPos = cursorPosition - 1;
          chars.splice(newPos, 1);
          setCursorPosition(newPos);
          return chars.join('');
        }
        return prev;
      });
    } else if (currentInput.length < mode || cursorPosition < currentInput.length) {
      setCurrentInput((prev) => {
        const chars = prev.split('');
        if (cursorPosition < chars.length) {
          // Replace existing letter at cursor
          chars[cursorPosition] = key.toUpperCase();
        } else {
          // Pad with spaces if needed and insert
          while (chars.length < cursorPosition) chars.push('');
          chars[cursorPosition] = key.toUpperCase();
        }
        const result = chars.join('');
        // Advance cursor to next empty spot
        let nextPos = cursorPosition + 1;
        while (nextPos < mode && chars[nextPos]) {
          nextPos++;
        }
        setCursorPosition(Math.min(nextPos, mode - 1));
        return result.slice(0, mode);
      });
    }
  }, [gameOver, currentInput, mode, validWords, dailyWord, guesses, stats, saveState, saveStats, showToast]);

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
    const emojiMap: Record<string, string> = {
      correct: '🟩',
      present: '🟨',
      absent: '⬛',
    };
    const grid = guesses
      .map((row) => row.map((t) => emojiMap[t.state] || '⬛').join(''))
      .join('\n');
    const result = won ? `${guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;
    return `Letreco ${dayNumber} (${mode} letras) ${result}\n\n${grid}`;
  }, [guesses, won, dayNumber, mode]);

  // Build board data
  const board: TileData[][] = [];
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    if (i < guesses.length) {
      board.push(guesses[i]);
    } else if (i === guesses.length && !gameOver) {
      // Current input row
      const row: TileData[] = [];
      for (let j = 0; j < mode; j++) {
        row.push({
          letter: currentInput[j]?.toUpperCase() || '',
          state: currentInput[j] ? 'tbd' : 'empty',
        });
      }
      board.push(row);
    } else {
      board.push(Array.from({ length: mode }, () => ({ letter: '', state: 'empty' as LetterState })));
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
    dailyWord,
    toastMessage,
    stats,
    revealingRow,
    showStats,
    setShowStats,
    onKeyPress,
    keyboardColors,
    shareResult,
    loaded,
  };
}
