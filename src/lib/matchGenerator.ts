/**
 * Match Generator Utility
 * Genera tutte le combinazioni di partite round-robin
 */

export interface MatchToCreate {
    tournament_id: number;
    group_id: number;
    team1_id: number;
    team2_id: number;
    team1_name: string;
    team2_name: string;
}

/**
 * Genera tutte le combinazioni di partite round-robin per un girone
 * Es: 4 squadre = 6 partite (A-B, A-C, A-D, B-C, B-D, C-D)
 *
 * @param teams Array di squadre del girone
 * @param groupId ID del girone
 * @param tournamentId ID del torneo
 * @returns Array di partite da creare
 */
export function generateRoundRobinMatches(
    teams: Array<{ id: number; team_name: string }>,
    groupId: number,
    tournamentId: number,
): MatchToCreate[] {
    if (teams.length < 2) {
        throw new Error("Sono necessarie almeno 2 squadre per generare le partite");
    }

    const matches: MatchToCreate[] = [];

    // Genera tutte le combinazioni possibili evitando duplicati
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            matches.push({
                tournament_id: tournamentId,
                group_id: groupId,
                team1_id: teams[i].id,
                team2_id: teams[j].id,
                team1_name: teams[i].team_name,
                team2_name: teams[j].team_name,
            });
        }
    }

    return matches;
}
