-- Migration: Add authentication and friends system
-- Run this in Supabase SQL Editor

-- 1. Update players table to support OAuth
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) UNIQUE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for auth lookups
CREATE INDEX IF NOT EXISTS idx_players_auth_user_id ON players(auth_user_id);

-- 2. Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);

-- 3. Create friend groups table
CREATE TABLE IF NOT EXISTS friend_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_friend_groups_owner ON friend_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_friend_groups_invite_code ON friend_groups(invite_code);

-- 4. Create group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES friend_groups(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_player ON group_members(player_id);

-- 5. Create view for friends leaderboard
CREATE OR REPLACE VIEW friends_leaderboard AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  gr.letter_mode,
  COUNT(*)::int AS games_played,
  SUM(CASE WHEN gr.won THEN 1 ELSE 0 END)::int AS games_won,
  ROUND(AVG(CASE WHEN gr.won THEN gr.attempts ELSE NULL END), 2) AS avg_attempts,
  ROUND(SUM(CASE WHEN gr.won THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS win_rate
FROM players p
JOIN game_results gr ON gr.player_id = p.id
WHERE gr.game_mode = 'daily'
GROUP BY p.id, p.display_name, p.avatar_url, gr.letter_mode;

-- 6. Enable RLS on new tables
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for friendships
CREATE POLICY "Users can view their friendships" ON friendships
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_user_id FROM players WHERE id = requester_id
      UNION
      SELECT auth_user_id FROM players WHERE id = addressee_id
    )
  );

CREATE POLICY "Users can create friend requests" ON friendships
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT auth_user_id FROM players WHERE id = requester_id)
  );

CREATE POLICY "Users can update their friendships" ON friendships
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT auth_user_id FROM players WHERE id = requester_id
      UNION
      SELECT auth_user_id FROM players WHERE id = addressee_id
    )
  );

-- 8. RLS Policies for friend groups
CREATE POLICY "Users can view groups they own or are members of" ON friend_groups
  FOR SELECT USING (
    auth.uid() = (SELECT auth_user_id FROM players WHERE id = owner_id)
    OR id IN (
      SELECT group_id FROM group_members gm
      JOIN players p ON p.id = gm.player_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON friend_groups
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT auth_user_id FROM players WHERE id = owner_id)
  );

CREATE POLICY "Group owners can update their groups" ON friend_groups
  FOR UPDATE USING (
    auth.uid() = (SELECT auth_user_id FROM players WHERE id = owner_id)
  );

CREATE POLICY "Group owners can delete their groups" ON friend_groups
  FOR DELETE USING (
    auth.uid() = (SELECT auth_user_id FROM players WHERE id = owner_id)
  );

-- 9. RLS Policies for group members
CREATE POLICY "Users can view group members" ON group_members
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM friend_groups fg
      WHERE auth.uid() = (SELECT auth_user_id FROM players WHERE id = fg.owner_id)
      OR fg.id IN (
        SELECT group_id FROM group_members gm2
        JOIN players p ON p.id = gm2.player_id
        WHERE p.auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT auth_user_id FROM players WHERE id = player_id)
  );

CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (
    auth.uid() = (SELECT auth_user_id FROM players WHERE id = player_id)
    OR auth.uid() = (
      SELECT p.auth_user_id FROM friend_groups fg
      JOIN players p ON p.id = fg.owner_id
      WHERE fg.id = group_id
    )
  );

-- 10. Function to get friends' stats for comparison
CREATE OR REPLACE FUNCTION get_friends_stats(p_player_id UUID, p_letter_mode INT)
RETURNS TABLE (
  player_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  games_played INT,
  games_won INT,
  win_rate NUMERIC,
  avg_attempts NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.id AS player_id,
    fl.display_name,
    fl.avatar_url,
    fl.games_played,
    fl.games_won,
    fl.win_rate,
    fl.avg_attempts
  FROM friends_leaderboard fl
  WHERE fl.letter_mode = p_letter_mode
  AND fl.id IN (
    -- Include the player themselves
    SELECT p_player_id
    UNION
    -- Include accepted friends
    SELECT f.addressee_id FROM friendships f WHERE f.requester_id = p_player_id AND f.status = 'accepted'
    UNION
    SELECT f.requester_id FROM friendships f WHERE f.addressee_id = p_player_id AND f.status = 'accepted'
  )
  ORDER BY fl.win_rate DESC, fl.avg_attempts ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to get group stats
CREATE OR REPLACE FUNCTION get_group_stats(p_group_id UUID, p_letter_mode INT)
RETURNS TABLE (
  player_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  games_played INT,
  games_won INT,
  win_rate NUMERIC,
  avg_attempts NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fl.id AS player_id,
    fl.display_name,
    fl.avatar_url,
    fl.games_played,
    fl.games_won,
    fl.win_rate,
    fl.avg_attempts
  FROM friends_leaderboard fl
  WHERE fl.letter_mode = p_letter_mode
  AND fl.id IN (
    SELECT gm.player_id FROM group_members gm WHERE gm.group_id = p_group_id
  )
  ORDER BY fl.win_rate DESC, fl.avg_attempts ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
