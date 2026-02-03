import { supabase, isSupabaseConfigured } from './supabase';
import type { GameStats } from '../hooks/useGame';
import type { User } from '@supabase/supabase-js';
import { MAX_ATTEMPTS } from '../constants';

const ANON_ID_KEY = 'letreco_anon_id';
const PLAYER_ID_KEY = 'letreco_player_id';
const DISPLAY_NAME_KEY = 'letreco_display_name';
const MIGRATED_KEY = 'letreco_migrated_to_db';

// Portuguese username generator - 30 adjectives + 30 nouns
const ADJECTIVES = [
  'Veloz', 'Sábio', 'Forte', 'Bravo', 'Astuto',
  'Ágil', 'Feliz', 'Nobre', 'Fiel', 'Calmo',
  'Gentil', 'Audaz', 'Vivaz', 'Leal', 'Doce',
  'Feroz', 'Manso', 'Ligeiro', 'Sereno', 'Firme',
  'Justo', 'Livre', 'Belo', 'Grande', 'Rápido',
  'Esperto', 'Alegre', 'Valente', 'Lúcido', 'Tenaz',
];

const NOUNS = [
  'Leão', 'Gato', 'Lobo', 'Tigre', 'Urso',
  'Falcão', 'Corvo', 'Panda', 'Raposa', 'Coelho',
  'Dragão', 'Fénix', 'Cobra', 'Tubarão', 'Golfinho',
  'Águia', 'Cavalo', 'Touro', 'Cervo', 'Javali',
  'Coruja', 'Puma', 'Lince', 'Pantera', 'Búfalo',
  'Lebre', 'Cisne', 'Pavão', 'Texugo', 'Ganso',
];

export function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${noun}${adj}`;
}

function generateAnonId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getAnonId(): string {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = generateAnonId();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export function getPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function getDisplayName(): string | null {
  return localStorage.getItem(DISPLAY_NAME_KEY);
}

// ============ Google Auth Functions ============

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: new Error('Supabase not configured') };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  return { error: error ? new Error(error.message) : null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;
  
  await supabase.auth.signOut();
  // Keep anonymous ID for local stats, but clear player link
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(DISPLAY_NAME_KEY);
  localStorage.removeItem(MIGRATED_KEY);
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!isSupabaseConfigured() || !supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}

// ============ Player Management ============

export async function ensurePlayer(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  // Check if user is logged in with Google
  const user = await getCurrentUser();
  
  if (user) {
    // User is authenticated - find or create player linked to their account
    const { data: existing } = await supabase
      .from('players')
      .select('id, display_name')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      localStorage.setItem(PLAYER_ID_KEY, existing.id);
      localStorage.setItem(DISPLAY_NAME_KEY, existing.display_name);
      return existing.id;
    }

    // Check if there's an anonymous player to link
    const anonId = getAnonId();
    const { data: anonPlayer } = await supabase
      .from('players')
      .select('id, display_name')
      .eq('anonymous_id', anonId)
      .is('user_id', null)
      .single();

    if (anonPlayer) {
      // Link anonymous player to Google account
      const displayName = user.user_metadata?.name || user.email?.split('@')[0] || anonPlayer.display_name;
      await supabase
        .from('players')
        .update({ 
          user_id: user.id, 
          display_name: displayName,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
        .eq('id', anonPlayer.id);
      
      localStorage.setItem(PLAYER_ID_KEY, anonPlayer.id);
      localStorage.setItem(DISPLAY_NAME_KEY, displayName);
      return anonPlayer.id;
    }

    // Create new player linked to Google account
    const displayName = user.user_metadata?.name || user.email?.split('@')[0] || generateDisplayName();
    const { data: created, error } = await supabase
      .from('players')
      .insert({ 
        user_id: user.id,
        anonymous_id: anonId,
        display_name: displayName,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || null,
      })
      .select('id, display_name')
      .single();

    if (error || !created) {
      console.error('Failed to create player:', error);
      return null;
    }

    localStorage.setItem(PLAYER_ID_KEY, created.id);
    localStorage.setItem(DISPLAY_NAME_KEY, created.display_name);
    return created.id;
  }

  // Anonymous user flow (existing logic)
  const existingId = getPlayerId();
  if (existingId) return existingId;

  const anonId = getAnonId();

  // Check if player already exists
  const { data: existing } = await supabase
    .from('players')
    .select('id, display_name')
    .eq('anonymous_id', anonId)
    .single();

  if (existing) {
    localStorage.setItem(PLAYER_ID_KEY, existing.id);
    localStorage.setItem(DISPLAY_NAME_KEY, existing.display_name);
    return existing.id;
  }

  // Create new player with generated name
  const displayName = generateDisplayName();
  const { data: created, error } = await supabase
    .from('players')
    .insert({ anonymous_id: anonId, display_name: displayName })
    .select('id, display_name')
    .single();

  if (error || !created) {
    console.error('Failed to create player:', error);
    return null;
  }

  localStorage.setItem(PLAYER_ID_KEY, created.id);
  localStorage.setItem(DISPLAY_NAME_KEY, created.display_name);
  return created.id;
}

export async function migrateLocalStats(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const playerId = await ensurePlayer();
  if (!playerId) return;

  for (const mode of [4, 5, 6, 7]) {
    try {
      const raw = localStorage.getItem(`letreco_stats_${mode}`);
      if (!raw) continue;
      const stats: GameStats = JSON.parse(raw);
      if (!stats.played) continue;

      const results: Array<Record<string, unknown>> = [];

      // Add wins based on distribution
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        for (let j = 0; j < (stats.distribution[i] || 0); j++) {
          results.push({
            player_id: playerId,
            letter_mode: mode,
            game_mode: 'daily',
            word: '?'.repeat(mode),
            attempts: i + 1,
            won: true,
            board: [],
          });
        }
      }

      // Add losses
      for (let j = 0; j < stats.played - stats.wins; j++) {
        results.push({
          player_id: playerId,
          letter_mode: mode,
          game_mode: 'daily',
          word: '?'.repeat(mode),
          attempts: MAX_ATTEMPTS,
          won: false,
          board: [],
        });
      }

      if (results.length > 0) {
        await supabase.from('game_results').insert(results);
      }
    } catch (e) {
      console.error(`Failed to migrate stats for mode ${mode}:`, e);
    }
  }

  localStorage.setItem(MIGRATED_KEY, '1');
}

export async function saveGameResult(params: {
  letterMode: number;
  gameMode: string;
  word: string;
  attempts: number;
  won: boolean;
  board: unknown;
  dailyDate?: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  const playerId = await ensurePlayer();
  if (!playerId) return;

  try {
    await supabase.from('game_results').insert({
      player_id: playerId,
      letter_mode: params.letterMode,
      game_mode: params.gameMode,
      word: params.word,
      attempts: params.attempts,
      won: params.won,
      board: params.board,
      daily_date: params.dailyDate || null,
    });
  } catch (e) {
    console.error('Failed to save game result:', e);
  }
}

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  games_played: number;
  games_won: number;
  win_rate: number;
  avg_attempts: number;
  letter_mode: number;
}

export async function fetchLeaderboard(letterMode: number): Promise<{
  entries: LeaderboardEntry[];
  playerRank: number | null;
}> {
  if (!isSupabaseConfigured() || !supabase) return { entries: [], playerRank: null };

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('letter_mode', letterMode)
    .gte('games_played', 3)
    .order('win_rate', { ascending: false })
    .order('avg_attempts', { ascending: true })
    .limit(20);

  if (error || !data) return { entries: [], playerRank: null };

  const playerId = getPlayerId();
  let playerRank: number | null = null;

  if (playerId) {
    const idx = (data as LeaderboardEntry[]).findIndex((e) => e.id === playerId);
    if (idx >= 0) playerRank = idx + 1;
  }

  return { entries: data as LeaderboardEntry[], playerRank };
}

export interface GameHistoryRecord {
  id: string;
  letter_mode: number;
  game_mode: string;
  word: string;
  attempts: number;
  won: boolean;
  board: unknown;
  played_at: string;
  daily_date: string | null;
}

export async function fetchGameHistory(params: {
  letterMode?: number;
  gameMode?: string;
  limit?: number;
  offset?: number;
}): Promise<GameHistoryRecord[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const playerId = getPlayerId();
  if (!playerId) return [];

  let query = supabase
    .from('game_results')
    .select('*')
    .eq('player_id', playerId)
    .order('played_at', { ascending: false })
    .limit(params.limit || 50)
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);

  if (params.letterMode) query = query.eq('letter_mode', params.letterMode);
  if (params.gameMode) query = query.eq('game_mode', params.gameMode);

  const { data, error } = await query;
  if (error || !data) return [];

  return data as GameHistoryRecord[];
}

export async function updateDisplayName(newName: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  
  const playerId = getPlayerId();
  if (!playerId) return false;

  const { error } = await supabase
    .from('players')
    .update({ display_name: newName })
    .eq('id', playerId);

  if (!error) {
    localStorage.setItem(DISPLAY_NAME_KEY, newName);
    return true;
  }
  return false;
}
