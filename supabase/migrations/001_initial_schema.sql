-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- Game results table
CREATE TABLE IF NOT EXISTS game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  letter_mode int NOT NULL CHECK (letter_mode IN (4, 5, 6, 7)),
  game_mode text NOT NULL CHECK (game_mode IN ('daily', 'practice')),
  word text NOT NULL,
  attempts int NOT NULL,
  won boolean NOT NULL,
  board jsonb NOT NULL,
  played_at timestamptz DEFAULT now(),
  daily_date date
);

CREATE INDEX idx_game_results_player ON game_results(player_id);
CREATE INDEX idx_game_results_letter_mode ON game_results(letter_mode);
CREATE INDEX idx_game_results_daily_date ON game_results(daily_date);

-- Daily words table
CREATE TABLE IF NOT EXISTS daily_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  letter_mode int NOT NULL CHECK (letter_mode IN (4, 5, 6, 7)),
  word text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
WITH streaks AS (
  SELECT
    player_id,
    letter_mode,
    won,
    played_at,
    ROW_NUMBER() OVER (PARTITION BY player_id, letter_mode ORDER BY played_at) -
    ROW_NUMBER() OVER (PARTITION BY player_id, letter_mode, won ORDER BY played_at) AS streak_group
  FROM game_results
  WHERE game_mode = 'daily'
),
streak_lengths AS (
  SELECT
    player_id,
    letter_mode,
    won,
    COUNT(*) AS streak_len
  FROM streaks
  GROUP BY player_id, letter_mode, won, streak_group
),
current_streaks AS (
  SELECT DISTINCT ON (gr.player_id, gr.letter_mode)
    gr.player_id,
    gr.letter_mode,
    CASE WHEN gr.won THEN
      (SELECT COUNT(*) FROM game_results g2
       WHERE g2.player_id = gr.player_id
         AND g2.letter_mode = gr.letter_mode
         AND g2.game_mode = 'daily'
         AND g2.played_at >= (
           SELECT COALESCE(MAX(g3.played_at), '1970-01-01'::timestamptz)
           FROM game_results g3
           WHERE g3.player_id = gr.player_id
             AND g3.letter_mode = gr.letter_mode
             AND g3.game_mode = 'daily'
             AND g3.won = false
         ))
    ELSE 0 END AS current_streak
  FROM game_results gr
  WHERE gr.game_mode = 'daily'
  ORDER BY gr.player_id, gr.letter_mode, gr.played_at DESC
)
SELECT
  p.id AS player_id,
  p.display_name,
  p.anonymous_id,
  gr.letter_mode,
  COUNT(*) AS games_played,
  ROUND(AVG(CASE WHEN gr.won THEN 1.0 ELSE 0.0 END) * 100, 1) AS win_rate,
  ROUND(AVG(CASE WHEN gr.won THEN gr.attempts ELSE NULL END), 1) AS avg_attempts,
  COALESCE(cs.current_streak, 0) AS current_streak,
  COALESCE(MAX(CASE WHEN sl.won THEN sl.streak_len ELSE 0 END), 0) AS max_streak
FROM game_results gr
JOIN players p ON p.id = gr.player_id
LEFT JOIN current_streaks cs ON cs.player_id = gr.player_id AND cs.letter_mode = gr.letter_mode
LEFT JOIN streak_lengths sl ON sl.player_id = gr.player_id AND sl.letter_mode = gr.letter_mode
WHERE gr.game_mode = 'daily'
GROUP BY p.id, p.display_name, p.anonymous_id, gr.letter_mode, cs.current_streak;

-- RLS policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_words ENABLE ROW LEVEL SECURITY;

-- Players: anyone can read, insert own
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Players can insert own" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update own" ON players FOR UPDATE USING (true);

-- Game results: anyone can read, insert own
CREATE POLICY "Game results viewable by everyone" ON game_results FOR SELECT USING (true);
CREATE POLICY "Game results insertable" ON game_results FOR INSERT WITH CHECK (true);

-- Daily words: read only
CREATE POLICY "Daily words viewable by everyone" ON daily_words FOR SELECT USING (true);
