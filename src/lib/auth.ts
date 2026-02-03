import { supabase, isSupabaseConfigured } from './supabase';
import type { GameStats } from '../hooks/useGame';
import { MAX_ATTEMPTS } from '../constants';

const ANON_ID_KEY = 'letreco_anon_id';
const PLAYER_ID_KEY = 'letreco_player_id';
const MIGRATED_KEY = 'letreco_migrated_to_db';

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

export async function ensurePlayer(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const existingId = getPlayerId();
  if (existingId) return existingId;
  const anonId = getAnonId();
  const { data: existing } = await supabase.from('players').select('id').eq('anonymous_id', anonId).single();
  if (existing) { localStorage.setItem(PLAYER_ID_KEY, existing.id); return existing.id; }
  const { data: created, error } = await supabase.from('players').insert({ anonymous_id: anonId }).select('id').single();
  if (error || !created) { console.error('Failed to create player:', error); return null; }
  localStorage.setItem(PLAYER_ID_KEY, created.id);
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
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        for (let j = 0; j < (stats.distribution[i] || 0); j++) {
          results.push({ player_id: playerId, letter_mode: mode, game_mode: 'daily', word: '?'.repeat(mode), attempts: i + 1, won: true, board: [] });
        }
      }
      for (let j = 0; j < stats.played - stats.wins; j++) {
        results.push({ player_id: playerId, letter_mode: mode, game_mode: 'daily', word: '?'.repeat(mode), attempts: MAX_ATTEMPTS, won: false, board: [] });
      }
      if (results.length > 0) await supabase.from('game_results').insert(results);
    } catch (e) { console.error(`Failed to migrate stats for mode ${mode}:`, e); }
  }
  localStorage.setItem(MIGRATED_KEY, '1');
}

export async function saveGameResult(params: {
  letterMode: number; gameMode: string; word: string; attempts: number; won: boolean; board: unknown; dailyDate?: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;
  const playerId = await ensurePlayer();
  if (!playerId) return;
  try {
    await supabase.from('game_results').insert({
      player_id: playerId, letter_mode: params.letterMode, game_mode: params.gameMode,
      word: params.word, attempts: params.attempts, won: params.won, board: params.board, daily_date: params.dailyDate || null,
    });
  } catch (e) { console.error('Failed to save game result:', e); }
}

export async function fetchLeaderboard(letterMode: number): Promise<{
  entries: Array<{ player_id: string; display_name: string | null; anonymous_id: string; games_played: number; win_rate: number; avg_attempts: number; current_streak: number; max_streak: number }>;
  playerRank: number | null;
}> {
  if (!isSupabaseConfigured() || !supabase) return { entries: [], playerRank: null };
  const { data, error } = await supabase.from('leaderboard').select('*').eq('letter_mode', letterMode).gte('games_played', 5).order('win_rate', { ascending: false }).order('avg_attempts', { ascending: true }).limit(20);
  if (error || !data) return { entries: [], playerRank: null };
  const playerId = getPlayerId();
  let playerRank: number | null = null;
  if (playerId) { const idx = data.findIndex((e: Record<string, unknown>) => e.player_id === playerId); if (idx >= 0) playerRank = idx + 1; }
  return { entries: data as Array<{ player_id: string; display_name: string | null; anonymous_id: string; games_played: number; win_rate: number; avg_attempts: number; current_streak: number; max_streak: number }>, playerRank };
}

export async function fetchGameHistory(params: {
  letterMode?: number; gameMode?: string; limit?: number; offset?: number;
}): Promise<Array<{ id: string; letter_mode: number; game_mode: string; word: string; attempts: number; won: boolean; board: unknown; played_at: string; daily_date: string | null }>> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const playerId = getPlayerId();
  if (!playerId) return [];
  let query = supabase.from('game_results').select('*').eq('player_id', playerId).order('played_at', { ascending: false }).limit(params.limit || 50).range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);
  if (params.letterMode) query = query.eq('letter_mode', params.letterMode);
  if (params.gameMode) query = query.eq('game_mode', params.gameMode);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Array<{ id: string; letter_mode: number; game_mode: string; word: string; attempts: number; won: boolean; board: unknown; played_at: string; daily_date: string | null }>;
}
