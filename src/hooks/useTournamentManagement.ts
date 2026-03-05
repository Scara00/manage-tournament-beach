import { useState, useCallback } from "react";
import type { Match } from "@/types";

export function useTournamentManagement(initialMatches: Match[] = []) {
    const [matches, setMatches] = useState(initialMatches);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<number, boolean>>({});
    const [collapsedMatchGroups, setCollapsedMatchGroups] = useState<Record<number, boolean>>({});
    const [editingMatch, setEditingMatch] = useState<number | null>(null);
    const [tempScores, setTempScores] = useState({ team1: "", team2: "" });

    const toggleGroup = useCallback((groupId: number) => {
        setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    }, []);

    const toggleMatchGroup = useCallback((groupId: number) => {
        setCollapsedMatchGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    }, []);

    const startEditMatch = useCallback((match: Match) => {
        setEditingMatch(match.id);
        setTempScores({
            team1: match.team1Score?.toString() || "",
            team2: match.team2Score?.toString() || "",
        });
    }, []);

    const startMatch = useCallback((matchId: number) => {
        setMatches((prev) =>
            prev.map((match) => {
                if (match.id === matchId && match.status === "scheduled") {
                    return { ...match, status: "in-progress" as const };
                }
                return match;
            })
        );
        cancelEdit();
    }, []);

    const saveScore = useCallback((matchId: number) => {
        setMatches((prev) =>
            prev.map((match) => {
                if (match.id === matchId) {
                    return {
                        ...match,
                        team1Score: parseInt(tempScores.team1) || 0,
                        team2Score: parseInt(tempScores.team2) || 0,
                        status: "completed" as const,
                        winner: parseInt(tempScores.team1) > parseInt(tempScores.team2) ? match.team1Id : match.team2Id,
                    };
                }
                return match;
            })
        );
        cancelEdit();
    }, [tempScores]);

    const cancelEdit = useCallback(() => {
        setEditingMatch(null);
        setTempScores({ team1: "", team2: "" });
    }, []);

    return {
        matches,
        collapsedGroups,
        collapsedMatchGroups,
        editingMatch,
        tempScores,
        toggleGroup,
        toggleMatchGroup,
        startEditMatch,
        startMatch,
        saveScore,
        cancelEdit,
        setTempScores,
    };
}
