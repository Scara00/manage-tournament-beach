/**
 * Group Types
 * Tipi relativi ai gironi
 */

import type { Team, TeamData } from "./team";

export interface Group {
    id: number;
    name: string;
    teams: Team[];
}

export interface GroupData {
    id: number;
    name: string;
    registered_teams?: TeamData[];
}

export interface GroupDetail {
    id: number;
    name: string;
    tournament_id: number;
    registered_teams?: any[];
}
