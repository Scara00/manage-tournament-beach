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

export async function registerTeamToTournament(tournamentId: number, teamData: {
    team_name: string;
    player1_name?: string;
    player2_name?: string;
}) {
    // 1. Get all groups for this tournament
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id')
        .eq('tournament_id', tournamentId);

    if (groupsError) throw groupsError;
    if (!groups || groups.length === 0) {
        throw new Error('No groups found for this tournament');
    }

    // 2. Find group with least teams
    const groupIds = groups.map(g => g.id);
    const { data: teamsPerGroup, error: teamsError } = await supabase
        .from('registered_teams')
        .select('group_id', { count: 'exact' })
        .in('group_id', groupIds);

    if (teamsError) throw teamsError;

    // Count teams per group
    const counts: Record<number, number> = {};
    groupIds.forEach(id => counts[id] = 0);
    teamsPerGroup?.forEach(team => {
        counts[team.group_id] = (counts[team.group_id] || 0) + 1;
    });

    // Find group with minimum teams
    const groupWithLeastTeams = groupIds.reduce((prev, current) =>
        counts[current] < counts[prev] ? current : prev
    );

    // 3. Register team to that group
    return createTeam({
        tournament_id: tournamentId,
        group_id: groupWithLeastTeams,
        ...teamData
    });
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

/**
 * Genera automaticamente tutte le partite round-robin per un girone
 * @param groupId ID del girone
 * @param tournamentId ID del torneo
 * @returns Risultato con numero di partite create
 */
export async function generateMatchesForGroup(
    groupId: number,
    tournamentId: number
) {
    try {
        // 1. Recupera tutte le squadre del girone
        const { data: teams, error: teamsError } = await supabase
            .from('registered_teams')
            .select('id, team_name')
            .eq('group_id', groupId);

        if (teamsError) throw teamsError;
        if (!teams || teams.length < 2) {
            throw new Error('Il girone deve avere almeno 2 squadre');
        }

        // 2. Genera le combinazioni round-robin
        const { generateRoundRobinMatches } = await import('./matchGenerator');
        const matchesToCreate = generateRoundRobinMatches(
            teams as Array<{ id: number; team_name: string }>,
            groupId,
            tournamentId
        );

        // 3. Inserisci tutte le partite con status "scheduled"
        const { data: createdMatches, error: insertError } = await supabase
            .from('matches')
            .insert(
                matchesToCreate.map((match) => ({
                    tournament_id: match.tournament_id,
                    group_id: match.group_id,
                    team1_id: match.team1_id,
                    team2_id: match.team2_id,
                    team1_name: match.team1_name,
                    team2_name: match.team2_name,
                    status: 'scheduled',
                    team1_score: null,
                    team2_score: null,
                    winner_id: null,
                }))
            )
            .select();

        if (insertError) throw insertError;

        return {
            success: true,
            message: `${createdMatches?.length || 0} partite create con successo`,
            matchCount: createdMatches?.length || 0,
        };
    } catch (error: any) {
        console.error('Errore nella generazione delle partite:', error);
        throw error;
    }
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

// ==========================================
// ATHLETE PORTAL
// ==========================================

export async function searchTeamsBySurname(surname: string) {
    const { data, error } = await supabase
        .from('registered_teams')
        .select(`
            *,
            tournament:tournament_id (
                id,
                name,
                date,
                location,
                status,
                category,
                structure
            ),
            group:group_id (
                id,
                name
            )
        `)
        .or(`player1_name.ilike.%${surname}%,player2_name.ilike.%${surname}%`);

    if (error) throw error;
    return data || [];
}

export async function getTournamentGroupsWithTeams(tournamentId: number) {
    const { data, error } = await supabase
        .from('groups')
        .select(`
            id,
            name,
            registered_teams (
                id,
                team_name,
                player1_name,
                player2_name,
                points,
                matches_played,
                wins,
                losses,
                sets_won,
                sets_lost
            )
        `)
        .eq('tournament_id', tournamentId);

    if (error) throw error;
    return data || [];
}

export async function getTournamentMatches(tournamentId: number) {
    const { data, error } = await supabase
        .from('matches')
        .select(`
            id,
            group_id,
            team1_id,
            team2_id,
            team1_name,
            team2_name,
            team1_score,
            team2_score,
            status,
            winner_id,
            match_date
        `)
        .eq('tournament_id', tournamentId)
        .order('match_date', { ascending: true });

    if (error) throw error;
    return data || [];
}
