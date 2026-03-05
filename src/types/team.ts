/**
 * Team Types
 * Tipi relativi alle squadre e ai dati dei team
 */

export interface Team {
    id: number;
    name: string;
    points: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    setsWon: number;
    setsLost: number;
}

export interface TeamData {
    id: number;
    team_name: string;
    player1_name?: string;
    player2_name?: string;
    points: number;
    matches_played: number;
    wins: number;
    losses: number;
    sets_won: number;
    sets_lost: number;
}

export interface RegisteredTeam {
    id: number;
    teamName: string;
    player1?: string;
    player2?: string;
    groupId: number;
}

export interface TeamStats {
    points?: number;
    matches_played?: number;
    wins?: number;
    losses?: number;
    sets_won?: number;
    sets_lost?: number;
}
