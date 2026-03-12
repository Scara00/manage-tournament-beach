import { supabase } from './supabase';

/**
 * Genera i podi finali per un bracket completato
 */
export async function generatePodium(
    tournamentId: number,
    bracketType: 'GOLD' | 'SILVER'
) {
    try {
        // Leggi il bracket
        const { data: brackets } = await supabase
            .from('tournament_brackets')
            .select('id')
            .eq('tournament_id', tournamentId)
            .eq('bracket_type', bracketType);

        if (!brackets || brackets.length === 0) return;

        const bracketId = brackets[0].id;

        // Leggi tutti i match del bracket
        const { data: matches } = await supabase
            .from('knockout_matches')
            .select('*')
            .eq('bracket_id', bracketId);

        if (!matches) return;

        // Trova la finale
        const finalMatch = matches.find((m) => m.round === 'FINAL' && m.status === 'completed');
        if (!finalMatch) return;

        // Vincitore (1° posto) - Chi ha vinto la finale
        const goldTeamId = finalMatch.winner_id;

        // 2° posto - Chi ha perso la finale
        const silverTeamId =
            finalMatch.winner_id === finalMatch.team1_id ? finalMatch.team2_id : finalMatch.team1_id;

        // 3° posto - Chi ha vinto la disputa terzo posto
        const thirdPlaceMatch = matches.find(
            (m) => m.round === 'THIRD_PLACE' && m.status === 'completed'
        );
        const bronzeTeamId = thirdPlaceMatch?.winner_id;

        // Carica i dati delle squadre
        const [goldData, silverData, bronzeData] = await Promise.all([
            supabase
                .from('registered_teams')
                .select('*')
                .eq('id', goldTeamId),
            supabase
                .from('registered_teams')
                .select('*')
                .eq('id', silverTeamId),
            bronzeTeamId
                ? supabase
                    .from('registered_teams')
                    .select('*')
                    .eq('id', bronzeTeamId)
                : Promise.resolve({ data: null }),
        ]);

        // Inserisci i podi
        const podiumInserts = [];

        if (goldData.data) {
            const team = goldData.data[0];
            podiumInserts.push({
                tournament_id: tournamentId,
                bracket_type: bracketType,
                position: 1,
                team_id: team.id,
                team_name: team.team_name,
                player1_name: team.player1_name,
                player2_name: team.player2_name,
            });
        }

        if (silverData.data) {
            const team = silverData.data[0];
            podiumInserts.push({
                tournament_id: tournamentId,
                bracket_type: bracketType,
                position: 2,
                team_id: team.id,
                team_name: team.team_name,
                player1_name: team.player1_name,
                player2_name: team.player2_name,
            });
        }

        if (bronzeData.data) {
            const team = bronzeData.data[0];
            podiumInserts.push({
                tournament_id: tournamentId,
                bracket_type: bracketType,
                position: 3,
                team_id: team.id,
                team_name: team.team_name,
                player1_name: team.player1_name,
                player2_name: team.player2_name,
            });
        }

        if (podiumInserts.length > 0) {
            await supabase.from('tournament_podium').upsert(podiumInserts);
        }
    } catch (error) {
        console.error('Errore nella generazione dei podi:', error);
    }
}

/**
 * Verifica se tutti i gironi di un torneo sono conclusi
 */
export async function areAllGroupsCompleted(tournamentId: number): Promise<boolean> {
    const { data: groups } = await supabase
        .from('groups')
        .select('id')
        .eq('tournament_id', tournamentId);

    if (!groups || groups.length === 0) return false;

    for (const group of groups) {
        const { data: matches } = await supabase
            .from('matches')
            .select('status')
            .eq('group_id', group.id);

        if (matches && matches.some((m) => m.status !== 'completed')) {
            return false;
        }
    }

    return true;
}

/**
 * Ottiene la classifica finale di un girone
 */
export async function getGroupStandings(groupId: number) {
    const { data: teams } = await supabase
        .from('registered_teams')
        .select('*')
        .eq('group_id', groupId)
        .order('points', { ascending: false })
        .order('sets_won', { ascending: false });

    return teams || [];
}

/**
 * Creazione automatica dei match della finale se le semifinali sono completate
 */
export async function createFinalMatch(bracketId: number, tournamentId: number) {
    const { data: semifinals } = await supabase
        .from('knockout_matches')
        .select('*')
        .eq('bracket_id', bracketId)
        .eq('round', 'SEMIFINAL');

    if (!semifinals || semifinals.length < 2) return;

    const allComplete = semifinals.every((m) => m.status === 'completed');
    if (!allComplete) return;

    // Verifica che la finale non esista già
    const { data: existingFinal } = await supabase
        .from('knockout_matches')
        .select('id')
        .eq('bracket_id', bracketId)
        .eq('round', 'FINAL');

    if (existingFinal && existingFinal.length > 0) return;

    const winner1 = semifinals[0].winner_id;
    const winner2 = semifinals[1].winner_id;

    // Ottieni i dati delle squadre
    const { data: team1Data } = await supabase
        .from('registered_teams')
        .select('*')
        .eq('id', winner1);

    const { data: team2Data } = await supabase
        .from('registered_teams')
        .select('*')
        .eq('id', winner2);

    if (!team1Data || !team2Data) return;

    // Crea la finale
    await supabase.from('knockout_matches').insert({
        bracket_id: bracketId,
        tournament_id: tournamentId,
        round: 'FINAL',
        team1_id: winner1,
        team2_id: winner2,
        team1_name: team1Data[0].team_name,
        team2_name: team2Data[0].team_name,
        status: 'scheduled',
    });

    // Crea la disputa terzo posto
    const loser1 =
        semifinals[0].winner_id === semifinals[0].team1_id
            ? semifinals[0].team2_id
            : semifinals[0].team1_id;

    const loser2 =
        semifinals[1].winner_id === semifinals[1].team1_id
            ? semifinals[1].team2_id
            : semifinals[1].team1_id;

    const { data: loser1Data } = await supabase
        .from('registered_teams')
        .select('*')
        .eq('id', loser1);

    const { data: loser2Data } = await supabase
        .from('registered_teams')
        .select('*')
        .eq('id', loser2);

    if (loser1Data && loser2Data) {
        await supabase.from('knockout_matches').insert({
            bracket_id: bracketId,
            tournament_id: tournamentId,
            round: 'THIRD_PLACE',
            team1_id: loser1,
            team2_id: loser2,
            team1_name: loser1Data[0].team_name,
            team2_name: loser2Data[0].team_name,
            status: 'scheduled',
        });
    }
}
