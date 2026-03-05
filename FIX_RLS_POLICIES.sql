-- ==========================================
-- FIX RLS POLICIES - Esegui questo script su Supabase SQL Editor
-- Questo script pulisce e ricrea tutte le politiche RLS
-- ==========================================

-- 1. DISABILITA RLS TEMPORANEAMENTE PER PULIRE
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE registered_teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE athletes DISABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_team_associations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. DROP TUTTE LE POLITICHE ESISTENTI
DROP POLICY IF EXISTS "Tournaments are viewable by everyone" ON tournaments;
DROP POLICY IF EXISTS "Tournaments can be created by authenticated users" ON tournaments;
DROP POLICY IF EXISTS "Tournaments can be updated by creator" ON tournaments;
DROP POLICY IF EXISTS "Tournaments can be deleted by creator" ON tournaments;

DROP POLICY IF EXISTS "Groups are viewable by everyone" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can update groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can delete groups" ON groups;

DROP POLICY IF EXISTS "Registered teams are viewable by everyone" ON registered_teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON registered_teams;
DROP POLICY IF EXISTS "Authenticated users can update teams" ON registered_teams;
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON registered_teams;

DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON matches;

DROP POLICY IF EXISTS "Athletes are viewable by everyone" ON athletes;
DROP POLICY IF EXISTS "Authenticated users can create athletes" ON athletes;
DROP POLICY IF EXISTS "Authenticated users can update athletes" ON athletes;
DROP POLICY IF EXISTS "Authenticated users can delete athletes" ON athletes;

DROP POLICY IF EXISTS "Athlete associations are viewable by everyone" ON athlete_team_associations;
DROP POLICY IF EXISTS "Authenticated users can create associations" ON athlete_team_associations;
DROP POLICY IF EXISTS "Authenticated users can update associations" ON athlete_team_associations;
DROP POLICY IF EXISTS "Authenticated users can delete associations" ON athlete_team_associations;

DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- 3. RIABILITA RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_team_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. RICREA TUTTE LE POLITICHE (SEMPLICATE E CORRETTE)

-- RLS for tournaments
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (true);
CREATE POLICY "Tournaments can be created by authenticated users" ON tournaments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Tournaments can be updated by creator" ON tournaments
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Tournaments can be deleted by creator" ON tournaments
  FOR DELETE USING (auth.uid() = created_by);

-- RLS for groups
CREATE POLICY "Groups are viewable by everyone" ON groups
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update groups" ON groups
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete groups" ON groups
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for registered_teams
CREATE POLICY "Registered teams are viewable by everyone" ON registered_teams
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON registered_teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update teams" ON registered_teams
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete teams" ON registered_teams
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for matches
CREATE POLICY "Matches are viewable by everyone" ON matches
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update matches" ON matches
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete matches" ON matches
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for athletes
CREATE POLICY "Athletes are viewable by everyone" ON athletes
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create athletes" ON athletes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update athletes" ON athletes
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete athletes" ON athletes
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for athlete_team_associations
CREATE POLICY "Athlete associations are viewable by everyone" ON athlete_team_associations
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create associations" ON athlete_team_associations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update associations" ON athlete_team_associations
  FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete associations" ON athlete_team_associations
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS for users (limitato agli utenti stessi)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 5. GRANT PERMISSIONS FINALI
GRANT ALL ON tournaments TO authenticated;
GRANT ALL ON groups TO authenticated;
GRANT ALL ON registered_teams TO authenticated;
GRANT ALL ON matches TO authenticated;
GRANT ALL ON athletes TO authenticated;
GRANT ALL ON athlete_team_associations TO authenticated;
GRANT ALL ON users TO authenticated;

-- Script completato ✅
