/**
 * Tournament Types
 * Tipi relativi ai tornei e alle loro strutture
 */

export interface Tournament {
    id: number;
    name: string;
    date: string;
    location: string;
    status: string;
    category: string;
    structure?: string;
    description?: string;
    max_participants?: number;
    entry_fee?: number;
    registration_deadline?: string;
    participants?: number;
    created_by?: string;
    groups?: any[];
    matches?: any[];
}

export interface TournamentData {
    id: number;
    name: string;
    date: string;
    status: string;
    location?: string;
    category?: string;
    structure?: string;
    group?: any[];
}

export interface TournamentDetailsData {
    id: number;
    name: string;
    date: string;
    location: string;
    status: string;
    category: string;
    structure: string;
    groups: any[];
    matches: any[];
}

export interface TournamentStructure {
    groups: number;
    teamsPerGroup: number;
    phases: {
        gold: number;
        silver: number;
        bronze?: number;
    };
    description: string;
}
