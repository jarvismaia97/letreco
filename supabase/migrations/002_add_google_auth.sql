-- Add Google Auth columns to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);

-- Update leaderboard view to include avatar
DROP VIEW IF EXISTS leaderboard;

CREATE VIEW leaderboard AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  gr.letter_mode,
  COUNT(*) as games_played,
  SUM(CASE WHEN gr.won THEN 1 ELSE 0 END) as games_won,
  ROUND(
    (SUM(CASE WHEN gr.won THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 
    1
  ) as win_rate,
  ROUND(
    AVG(CASE WHEN gr.won THEN gr.attempts ELSE NULL END)::numeric, 
    2
  ) as avg_attempts
FROM players p
JOIN game_results gr ON p.id = gr.player_id
GROUP BY p.id, p.display_name, p.avatar_url, gr.letter_mode;

-- Grant access
GRANT SELECT ON leaderboard TO anon, authenticated;
