-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game results table
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  letter_mode INT NOT NULL CHECK (letter_mode IN (4, 5, 6, 7)),
  game_mode TEXT NOT NULL CHECK (game_mode IN ('daily', 'practice')),
  word TEXT NOT NULL,
  attempts INT NOT NULL,
  won BOOLEAN NOT NULL,
  board JSONB,
  daily_date DATE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily words table (for future use)
CREATE TABLE daily_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  letter_mode INT NOT NULL CHECK (letter_mode IN (4, 5, 6, 7)),
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, letter_mode)
);

-- Indexes
CREATE INDEX idx_game_results_player ON game_results(player_id);
CREATE INDEX idx_game_results_daily ON game_results(daily_date, letter_mode);
CREATE INDEX idx_players_anonymous ON players(anonymous_id);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.display_name,
  COUNT(*) as games_played,
  COUNT(*) FILTER (WHERE gr.won) as games_won,
  ROUND(100.0 * COUNT(*) FILTER (WHERE gr.won) / NULLIF(COUNT(*), 0), 1) as win_rate,
  ROUND(AVG(gr.attempts) FILTER (WHERE gr.won), 2) as avg_attempts,
  gr.letter_mode
FROM players p
JOIN game_results gr ON p.id = gr.player_id
GROUP BY p.id, p.display_name, gr.letter_mode
HAVING COUNT(*) >= 3;

-- RLS policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read all" ON players FOR SELECT USING (true);
CREATE POLICY "Players can insert own" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Game results readable" ON game_results FOR SELECT USING (true);
CREATE POLICY "Game results insertable" ON game_results FOR INSERT WITH CHECK (true);
