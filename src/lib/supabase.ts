import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// TOURNAMENTS
// ==========================================

export async function getTournaments() {
    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getTournamentsWithTeamCount() {
    const { data, error } = await supabase
        .from('tournaments')
        .select(`
            *,
            registered_teams (id)
        `)
        .order('date', { ascending: false });

    if (error) throw error;

    // Map data to include participants count
    return data?.map((tournament: any) => ({
        ...tournament,
        participants: tournament.registered_teams?.length || 0,
    })) || [];
}

export async function getTournamentById(id: number) {
    const { data, error } = await supabase
        .from('tournaments')
        .select(`
      *,
      groups (
        *,
        registered_teams (*)
      ),
      matches (*)
    `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createTournament(tournament: {
    name: string;
    date: string;
    location: string;
    status: string;
    category: string;
    structure: string;
}, userId: string) {
    const { data, error } = await supabase
        .from('tournaments')
        .insert([{ ...tournament, created_by: userId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateTournament(id: number, updates: any) {
    const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteTournament(id: number) {
    const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ==========================================
// GROUPS
// ==========================================

export async function getGroupsByTournament(tournamentId: number) {
    const { data, error } = await supabase
        .from('groups')
        .select(`
      *,
      registered_teams (*)
    `)
        .eq('tournament_id', tournamentId);

    if (error) throw error;
    return data;
}

export async function createGroup(group: {
    tournament_id: number;
    name: string;
}) {
    const { data, error } = await supabase
        .from('groups')
        .insert([group])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// REGISTERED TEAMS
// ==========================================

export async function getTeamsByGroup(groupId: number) {
    const { data, error } = await supabase
        .from('registered_teams')
        .select('*')
        .eq('group_id', groupId)
        .order('points', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createTeam(team: {
    tournament_id: number;
    group_id: number;
    team_name: string;
    player1_name?: string;
    player2_name?: string;
}) {
    const { data, error } = await supabase
        .from('registered_teams')
        .insert([team])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateTeamStats(teamId: number, stats: {
    points?: number;
    matches_played?: number;
    wins?: number;
    losses?: number;
    sets_won?: number;
    sets_lost?: number;
}) {
    const { data, error } = await supabase
        .from('registered_teams')
        .update(stats)
        .eq('id', teamId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// MATCHES
// ==========================================

export async function getMatchesByGroup(groupId: number) {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('group_id', groupId)
        .order('match_date', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getMatchesByTournament(tournamentId: number) {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('match_date', { ascending: true });

    if (error) throw error;
    return data;
}

export async function createMatch(match: {
    tournament_id: number;
    group_id: number;
    team1_id: number;
    team2_id: number;
    team1_name: string;
    team2_name: string;
    match_date?: string;
}) {
    const { data, error } = await supabase
        .from('matches')
        .insert([{ ...match, status: 'scheduled' }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateMatchStatus(matchId: number, status: 'scheduled' | 'in-progress' | 'completed') {
    const { data, error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateMatchScore(
    matchId: number,
    team1Score: number,
    team2Score: number,
    winnerId?: number
) {
    const { data, error } = await supabase
        .from('matches')
        .update({
            team1_score: team1Score,
            team2_score: team2Score,
            status: 'completed',
            winner_id: winnerId,
        })
        .eq('id', matchId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// ATHLETES
// ==========================================

export async function getAthletesBySurname(surname: string) {
    const { data, error } = await supabase
        .from('athletes')
        .select(`
      *,
      athlete_team_associations (
        *,
        registered_teams (*),
        tournaments (*)
      )
    `)
        .ilike('surname', `%${surname}%`);

    if (error) throw error;
    return data;
}

export async function getAthleteTeams(athleteId: number) {
    const { data, error } = await supabase
        .from('athlete_team_associations')
        .select(`
      *,
      registered_teams (
        *,
        groups (
          *
        )
      ),
      tournaments (*)
    `)
        .eq('athlete_id', athleteId);

    if (error) throw error;
    return data;
}

export async function createAthlete(athlete: {
    surname: string;
    name?: string;
    email?: string;
    phone?: string;
}) {
    const { data, error } = await supabase
        .from('athletes')
        .insert([athlete])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function associateAthleteWithTeam(
    athleteId: number,
    teamId: number,
    tournamentId: number
) {
    const { data, error } = await supabase
        .from('athlete_team_associations')
        .insert([{ athlete_id: athleteId, team_id: teamId, tournament_id: tournamentId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// USERS
// ==========================================

export async function createUser(userId: string, username: string, email: string) {
    const { data, error } = await supabase
        .from('users')
        .insert([{ id: userId, username, email, role: 'organizer' }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getUser(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// AUTH
// ==========================================

export async function signUpOrganizer(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username },
        },
    });

    if (error) throw error;

    // Create user record
    if (data.user) {
        await createUser(data.user.id, username, email);
    }

    return data;
}

export async function signInOrganizer(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user || null);
    });
}
