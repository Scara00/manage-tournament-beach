/**
 * Match Types
 * Tipi relativi alle partite
 */

export interface Match {
    id: number;
    groupId: number;
    team1Id: number;
    team2Id: number;
    team1Name: string;
    team2Name: string;
    team1Score?: number;
    team2Score?: number;
    status: "scheduled" | "in-progress" | "completed";
    winner?: number;
}

export interface MatchData {
    id: number;
    group_id: number;
    team1_id: number;
    team2_id: number;
    team1_name: string;
    team2_name: string;
    team1_score?: number;
    team2_score?: number;
    status: "scheduled" | "in-progress" | "completed";
    winner_id?: number;
}

export type MatchStatus = "scheduled" | "in-progress" | "completed";

export interface MatchScore {
    team1: number;
    team2: number;
}
