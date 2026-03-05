-- ==========================================
-- SCHEMA DATABASE SUPABASE - BEACH VOLLEY TOURNAMENT
-- ==========================================

-- 1. CREATE TOURNAMENTS TABLE
CREATE TABLE tournaments (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('In Preparazione', 'Attivo', 'Completato')),
  category TEXT NOT NULL CHECK (category IN ('2x2 Misto', '2x2 Maschile', '2x2 Femminile')),
  structure TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. CREATE GROUPS TABLE
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, name)
);

-- 3. CREATE REGISTERED TEAMS TABLE
CREATE TABLE registered_teams (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  player1_name TEXT,
  player2_name TEXT,
  points INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  sets_won INTEGER DEFAULT 0,
  sets_lost INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, group_id, team_name)
);

-- 4. CREATE MATCHES TABLE
CREATE TABLE matches (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  team1_id BIGINT NOT NULL REFERENCES registered_teams(id) ON DELETE CASCADE,
  team2_id BIGINT NOT NULL REFERENCES registered_teams(id) ON DELETE CASCADE,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  team1_score INTEGER,
  team2_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed')),
  winner_id BIGINT REFERENCES registered_teams(id) ON DELETE SET NULL,
  match_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE ATHLETES TABLE (per il portale atleti)
CREATE TABLE athletes (
  id BIGSERIAL PRIMARY KEY,
  surname TEXT NOT NULL,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE ATHLETE_TEAM_ASSOCIATIONS TABLE (many-to-many)
CREATE TABLE athlete_team_associations (
  id BIGSERIAL PRIMARY KEY,
  athlete_id BIGINT NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  team_id BIGINT NOT NULL REFERENCES registered_teams(id) ON DELETE CASCADE,
  tournament_id BIGINT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(athlete_id, team_id, tournament_id)
);

-- 7. CREATE USERS TABLE (per gli organizzatori)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('organizer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_groups_tournament_id ON groups(tournament_id);
CREATE INDEX idx_registered_teams_tournament_id ON registered_teams(tournament_id);
CREATE INDEX idx_registered_teams_group_id ON registered_teams(group_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_group_id ON matches(group_id);
CREATE INDEX idx_matches_team1_id ON matches(team1_id);
CREATE INDEX idx_matches_team2_id ON matches(team2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_athlete_team_athlete_id ON athlete_team_associations(athlete_id);
CREATE INDEX idx_athlete_team_team_id ON athlete_team_associations(team_id);
CREATE INDEX idx_athlete_team_tournament_id ON athlete_team_associations(tournament_id);
CREATE INDEX idx_athletes_surname ON athletes(surname);
CREATE INDEX idx_users_username ON users(username);

-- ==========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================

-- RLS for tournaments
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (true);
CREATE POLICY "Tournaments can be created by authenticated users" ON tournaments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Tournaments can be updated by creator" ON tournaments
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Tournaments can be deleted by creator" ON tournaments
  FOR DELETE USING (auth.uid() = created_by);

-- RLS for groups
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are viewable by everyone" ON groups
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update groups" ON groups
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete groups" ON groups
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for registered_teams
ALTER TABLE registered_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registered teams are viewable by everyone" ON registered_teams
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON registered_teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update teams" ON registered_teams
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete teams" ON registered_teams
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches are viewable by everyone" ON matches
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update matches" ON matches
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete matches" ON matches
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for athletes
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athletes are viewable by everyone" ON athletes
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create athletes" ON athletes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update athletes" ON athletes
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete athletes" ON athletes
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for athlete_team_associations
ALTER TABLE athlete_team_associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Athlete associations are viewable by everyone" ON athlete_team_associations
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create associations" ON athlete_team_associations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update associations" ON athlete_team_associations
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete associations" ON athlete_team_associations
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- CREATE FUNCTIONS FOR TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- CREATE TRIGGERS
-- ==========================================

CREATE TRIGGER tournaments_update_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER groups_update_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER registered_teams_update_updated_at
  BEFORE UPDATE ON registered_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER matches_update_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER athletes_update_updated_at
  BEFORE UPDATE ON athletes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER users_update_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

GRANT ALL ON tournaments TO authenticated;
GRANT ALL ON groups TO authenticated;
GRANT ALL ON registered_teams TO authenticated;
GRANT ALL ON matches TO authenticated;
GRANT ALL ON athletes TO authenticated;
GRANT ALL ON athlete_team_associations TO authenticated;
GRANT ALL ON users TO authenticated;
