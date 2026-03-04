import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Trophy,
  Users,
  Play,
  Check,
  Clock,
  Edit,
  Save,
  X,
  ChevronDown,
} from "lucide-react";

// Tipi di dati per il torneo
interface Team {
  id: number;
  name: string;
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
}

interface Group {
  id: number;
  name: string;
  teams: Team[];
}

interface Match {
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

interface RegisteredTeam {
  id: number;
  teamName: string;
  player1?: string;
  player2?: string;
  groupId: number;
}

export default function TournamentManagement() {
  // Stati per la gestione del torneo
  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "Girone A",
      teams: [
        {
          id: 1,
          name: "Thunder Beach",
          points: 6,
          matchesPlayed: 3,
          wins: 3,
          losses: 0,
          setsWon: 3,
          setsLost: 0,
        },
        {
          id: 2,
          name: "Wave Riders",
          points: 2,
          matchesPlayed: 3,
          wins: 1,
          losses: 2,
          setsWon: 1,
          setsLost: 2,
        },
        {
          id: 3,
          name: "Sand Warriors",
          points: 4,
          matchesPlayed: 3,
          wins: 2,
          losses: 1,
          setsWon: 2,
          setsLost: 1,
        },
        {
          id: 4,
          name: "Beach Kings",
          points: 0,
          matchesPlayed: 3,
          wins: 0,
          losses: 3,
          setsWon: 0,
          setsLost: 3,
        },
      ],
    },
    {
      id: 2,
      name: "Girone B",
      teams: [
        {
          id: 5,
          name: "Volleyball Stars",
          points: 6,
          matchesPlayed: 3,
          wins: 3,
          losses: 0,
          setsWon: 3,
          setsLost: 0,
        },
        {
          id: 6,
          name: "Coast Crushers",
          points: 0,
          matchesPlayed: 3,
          wins: 0,
          losses: 3,
          setsWon: 0,
          setsLost: 3,
        },
        {
          id: 7,
          name: "Sun Spikers",
          points: 4,
          matchesPlayed: 3,
          wins: 2,
          losses: 1,
          setsWon: 2,
          setsLost: 1,
        },
        {
          id: 8,
          name: "Seaside Smash",
          points: 2,
          matchesPlayed: 3,
          wins: 1,
          losses: 2,
          setsWon: 1,
          setsLost: 2,
        },
      ],
    },
  ]);

  const [matches, setMatches] = useState<Match[]>([
    // Girone A
    {
      id: 1,
      groupId: 1,
      team1Id: 1,
      team2Id: 2,
      team1Name: "Thunder Beach",
      team2Name: "Wave Riders",
      team1Score: 21,
      team2Score: 19,
      status: "completed",
      winner: 1,
    },
    {
      id: 2,
      groupId: 1,
      team1Id: 3,
      team2Id: 4,
      team1Name: "Sand Warriors",
      team2Name: "Beach Kings",
      team1Score: 21,
      team2Score: 15,
      status: "completed",
      winner: 3,
    },
    {
      id: 3,
      groupId: 1,
      team1Id: 1,
      team2Id: 3,
      team1Name: "Thunder Beach",
      team2Name: "Sand Warriors",
      team1Score: 21,
      team2Score: 18,
      status: "completed",
      winner: 1,
    },
    {
      id: 4,
      groupId: 1,
      team1Id: 2,
      team2Id: 4,
      team1Name: "Wave Riders",
      team2Name: "Beach Kings",
      status: "scheduled",
    },
    {
      id: 5,
      groupId: 1,
      team1Id: 1,
      team2Id: 4,
      team1Name: "Thunder Beach",
      team2Name: "Beach Kings",
      status: "scheduled",
    },
    {
      id: 6,
      groupId: 1,
      team1Id: 2,
      team2Id: 3,
      team1Name: "Wave Riders",
      team2Name: "Sand Warriors",
      status: "in-progress",
    },
    // Girone B
    {
      id: 7,
      groupId: 2,
      team1Id: 5,
      team2Id: 6,
      team1Name: "Volleyball Stars",
      team2Name: "Coast Crushers",
      team1Score: 21,
      team2Score: 12,
      status: "completed",
      winner: 5,
    },
    {
      id: 8,
      groupId: 2,
      team1Id: 7,
      team2Id: 8,
      team1Name: "Sun Spikers",
      team2Name: "Seaside Smash",
      team1Score: 21,
      team2Score: 19,
      status: "completed",
      winner: 7,
    },
    {
      id: 9,
      groupId: 2,
      team1Id: 5,
      team2Id: 7,
      team1Name: "Volleyball Stars",
      team2Name: "Sun Spikers",
      team1Score: 21,
      team2Score: 18,
      status: "completed",
      winner: 5,
    },
    {
      id: 10,
      groupId: 2,
      team1Id: 6,
      team2Id: 8,
      team1Name: "Coast Crushers",
      team2Name: "Seaside Smash",
      status: "scheduled",
    },
    {
      id: 11,
      groupId: 2,
      team1Id: 5,
      team2Id: 8,
      team1Name: "Volleyball Stars",
      team2Name: "Seaside Smash",
      status: "scheduled",
    },
    {
      id: 12,
      groupId: 2,
      team1Id: 6,
      team2Id: 7,
      team1Name: "Coast Crushers",
      team2Name: "Sun Spikers",
      status: "in-progress",
    },
  ]);

  const [registeredTeams] = useState<RegisteredTeam[]>([
    {
      id: 1,
      teamName: "Thunder Beach",
      player1: "Marco Rossi",
      player2: "Luca Bianchi",
      groupId: 1,
    },
    {
      id: 2,
      teamName: "Wave Riders",
      player1: "Alessandro Verde",
      player2: "Francesco Neri",
      groupId: 1,
    },
    {
      id: 3,
      teamName: "Sand Warriors",
      player1: "Giuseppe Silvestri",
      player2: "Antonio Gialli",
      groupId: 1,
    },
    {
      id: 4,
      teamName: "Beach Kings",
      player1: "Roberto Blu",
      player2: "Stefano Viola",
      groupId: 1,
    },
    {
      id: 5,
      teamName: "Volleyball Stars",
      player1: "Diego Rosa",
      player2: "Matteo Arancione",
      groupId: 2,
    },
    {
      id: 6,
      teamName: "Coast Crushers",
      player1: "Fabio Grigio",
      player2: "Andrea Marrone",
      groupId: 2,
    },
    {
      id: 7,
      teamName: "Sun Spikers",
      player1: "Paolo Azzurro",
      player2: "Simone Celeste",
      groupId: 2,
    },
    {
      id: 8,
      teamName: "Seaside Smash",
      player1: "Carlo Indaco",
      player2: "Davide Turchese",
      groupId: 2,
    },
  ]);

  // Stati per collassare le sezioni
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<number, boolean>
  >({});
  const [collapsedMatchGroups, setCollapsedMatchGroups] = useState<
    Record<number, boolean>
  >({});
  const [teamsCollapsed, setTeamsCollapsed] = useState(false);

  const toggleGroup = (groupId: number) =>
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  const toggleMatchGroup = (groupId: number) =>
    setCollapsedMatchGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  // Stati per l'editing
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [tempScores, setTempScores] = useState<{
    team1: string;
    team2: string;
  }>({ team1: "", team2: "" });
  const [tempTeamData, setTempTeamData] = useState<{
    teamName: string;
    player1: string;
    player2: string;
  }>({ teamName: "", player1: "", player2: "" });

  // Funzioni helper
  const getStatusBadge = (status: Match["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="text-xs h-4 px-1">
            <Clock className="w-2 h-2 mr-1" />
            Da Giocare
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="default" className="text-xs h-4 px-1">
            <Play className="w-2 h-2 mr-1" />
            In Corso
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="text-xs h-4 px-1">
            <Check className="w-2 h-2 mr-1" />
            Completata
          </Badge>
        );
    }
  };

  const startEditMatch = (match: Match) => {
    setEditingMatch(match.id);
    setTempScores({
      team1: match.team1Score?.toString() || "",
      team2: match.team2Score?.toString() || "",
    });
  };

  const startEditTeam = (team: RegisteredTeam) => {
    setEditingTeam(team.id);
    setTempTeamData({
      teamName: team.teamName,
      player1: team.player1 || "",
      player2: team.player2 || "",
    });
  };

  const cancelEdit = () => {
    setEditingMatch(null);
    setTempScores({ team1: "", team2: "" });
  };

  const cancelEditTeam = () => {
    setEditingTeam(null);
    setTempTeamData({ teamName: "", player1: "", player2: "" });
  };

  const saveMatch = (matchId: number) => {
    const team1Score = parseInt(tempScores.team1);
    const team2Score = parseInt(tempScores.team2);

    // Validazione beach volley: set va a 21 con differenza di 2
    if (
      team1Score < 0 ||
      team2Score < 0 ||
      (Math.max(team1Score, team2Score) < 21 &&
        Math.abs(team1Score - team2Score) < 2) ||
      (Math.max(team1Score, team2Score) >= 21 &&
        Math.abs(team1Score - team2Score) < 2)
    ) {
      alert(
        "Punteggio non valido per beach volley. Serve almeno 21 punti e 2 di differenza.",
      );
      return;
    }

    const winner =
      team1Score > team2Score
        ? matches.find((m) => m.id === matchId)?.team1Id
        : matches.find((m) => m.id === matchId)?.team2Id;

    setMatches(
      matches.map((match) => {
        if (match.id === matchId) {
          return {
            ...match,
            team1Score,
            team2Score,
            status: "completed" as const,
            winner,
          };
        }
        return match;
      }),
    );

    // Aggiorna le statistiche dei gironi
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      setGroups(
        groups.map((group) => {
          if (group.id === match.groupId) {
            return {
              ...group,
              teams: group.teams.map((team) => {
                if (team.id === match.team1Id) {
                  const won = team1Score > team2Score;
                  return {
                    ...team,
                    points: team.points + (won ? 2 : 0),
                    wins: team.wins + (won ? 1 : 0),
                    losses: team.losses + (won ? 0 : 1),
                    setsWon: team.setsWon + (won ? 1 : 0),
                    setsLost: team.setsLost + (won ? 0 : 1),
                    matchesPlayed: team.matchesPlayed + 1,
                  };
                }
                if (team.id === match.team2Id) {
                  const won = team2Score > team1Score;
                  return {
                    ...team,
                    points: team.points + (won ? 2 : 0),
                    wins: team.wins + (won ? 1 : 0),
                    losses: team.losses + (won ? 0 : 1),
                    setsWon: team.setsWon + (won ? 1 : 0),
                    setsLost: team.setsLost + (won ? 0 : 1),
                    matchesPlayed: team.matchesPlayed + 1,
                  };
                }
                return team;
              }),
            };
          }
          return group;
        }),
      );
    }

    cancelEdit();
  };

  const saveTeam = () => {
    if (!tempTeamData.teamName.trim()) {
      alert("Il nome della squadra è obbligatorio");
      return;
    }
    // In un'app reale, qui aggiorneresti il database
    alert("Squadra aggiornata con successo!");
    cancelEditTeam();
  };

  const totalMatches = matches.length;
  const completedMatches = matches.filter(
    (m) => m.status === "completed",
  ).length;
  const progressPercentage = Math.round(
    (completedMatches / totalMatches) * 100,
  );

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Home
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold leading-tight">
            Gestione Torneo — Torneo Estivo 2026
          </h1>
          <p className="text-xs text-muted-foreground">
            Gestisci i gironi e i risultati delle partite
          </p>
        </div>
        {/* Progresso inline nell'header */}
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground text-xs">
            {completedMatches}/{totalMatches} partite
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-blue-700">
            {progressPercentage}%
          </span>
        </div>
      </div>

      {/* Corpo principale: sinistra 65% (partite + squadre) | destra 35% (gironi) */}
      <div className="flex flex-col xl:flex-row gap-4 items-start">
        {/* ── COLONNA SINISTRA — Partite + Squadre ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Sezione Partite */}
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-muted-foreground uppercase tracking-wide">
              <Play className="h-3.5 w-3.5" />
              Gestione Partite
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {groups.map((group) => {
                const matchCount = matches.filter(
                  (m) => m.groupId === group.id,
                ).length;
                const doneCount = matches.filter(
                  (m) => m.groupId === group.id && m.status === "completed",
                ).length;
                return (
                  <Card key={group.id}>
                    <button
                      type="button"
                      onClick={() => toggleMatchGroup(group.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors rounded-t-xl">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        {group.name}
                        <span className="text-xs font-normal text-muted-foreground">
                          {doneCount}/{matchCount} partite
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          collapsedMatchGroups[group.id] ? "-rotate-90" : ""
                        }`}
                      />
                    </button>
                    {!collapsedMatchGroups[group.id] && (
                      <CardContent className="px-4 pb-3 pt-0">
                        <div className="space-y-2">
                          {matches
                            .filter((match) => match.groupId === group.id)
                            .map((match) => (
                              <div
                                key={match.id}
                                className={`border rounded-lg p-2.5 ${
                                  match.status === "completed"
                                    ? "bg-green-50 border-green-200"
                                    : match.status === "in-progress"
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-gray-50 border-gray-200"
                                }`}>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span className="font-medium text-xs truncate">
                                      {match.team1Name} vs {match.team2Name}
                                    </span>
                                    {getStatusBadge(match.status)}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditMatch(match)}
                                    className={`h-6 px-2 text-xs shrink-0 ${
                                      match.status !== "completed"
                                        ? "text-blue-600 hover:text-blue-800"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}>
                                    <Edit className="h-2.5 w-2.5 mr-1" />
                                    {match.status !== "completed"
                                      ? "Inserisci"
                                      : "Modifica"}
                                  </Button>
                                </div>

                                {editingMatch === match.id ? (
                                  <div className="mt-2 space-y-2 bg-white p-2.5 rounded border">
                                    <p className="text-xs text-muted-foreground">
                                      💡 Set da 21 punti con differenza di 2.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-xs font-medium text-blue-600 block mb-1">
                                          {match.team1Name}
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="50"
                                          placeholder="0"
                                          className="h-8 text-center font-semibold"
                                          value={tempScores.team1}
                                          onChange={(e) =>
                                            setTempScores((prev) => ({
                                              ...prev,
                                              team1: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-red-600 block mb-1">
                                          {match.team2Name}
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="50"
                                          placeholder="0"
                                          className="h-8 text-center font-semibold"
                                          value={tempScores.team2}
                                          onChange={(e) =>
                                            setTempScores((prev) => ({
                                              ...prev,
                                              team2: e.target.value,
                                            }))
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <Button
                                        size="sm"
                                        onClick={() => saveMatch(match.id)}
                                        className="h-7 text-xs bg-green-600 hover:bg-green-700">
                                        <Check className="h-3 w-3 mr-1" />
                                        Salva
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEdit}
                                        className="h-7 text-xs">
                                        Annulla
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  match.status === "completed" && (
                                    <div className="mt-1.5 flex items-center justify-between">
                                      <div className="flex items-center gap-1 text-sm">
                                        <span
                                          className={`font-bold ${match.winner === match.team1Id ? "text-green-700" : "text-gray-500"}`}>
                                          {match.team1Score}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                          —
                                        </span>
                                        <span
                                          className={`font-bold ${match.winner === match.team2Id ? "text-green-700" : "text-gray-500"}`}>
                                          {match.team2Score}
                                        </span>
                                      </div>
                                      {match.winner && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-green-100 text-green-800 border-green-300">
                                          🏆{" "}
                                          {match.winner === match.team1Id
                                            ? match.team1Name
                                            : match.team2Name}
                                        </Badge>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sezione Squadre Iscritte */}
          <div>
            <Card>
              <button
                type="button"
                onClick={() => setTeamsCollapsed((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors rounded-t-xl">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Squadre Iscritte
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {registeredTeams.length}
                  </Badge>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    teamsCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>
              {!teamsCollapsed && (
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {registeredTeams.map((team) => (
                      <div
                        key={team.id}
                        className="border rounded-lg p-2.5 bg-gray-50/50">
                        {editingTeam === team.id ? (
                          <div className="space-y-1.5">
                            <Input
                              placeholder="Nome squadra"
                              className="h-6 text-xs"
                              value={tempTeamData.teamName}
                              onChange={(e) =>
                                setTempTeamData((prev) => ({
                                  ...prev,
                                  teamName: e.target.value,
                                }))
                              }
                            />
                            <Input
                              placeholder="Giocatore 1"
                              className="h-6 text-xs"
                              value={tempTeamData.player1}
                              onChange={(e) =>
                                setTempTeamData((prev) => ({
                                  ...prev,
                                  player1: e.target.value,
                                }))
                              }
                            />
                            <Input
                              placeholder="Giocatore 2"
                              className="h-6 text-xs"
                              value={tempTeamData.player2}
                              onChange={(e) =>
                                setTempTeamData((prev) => ({
                                  ...prev,
                                  player2: e.target.value,
                                }))
                              }
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => saveTeam()}
                                className="h-6 text-xs flex-1 bg-green-600 hover:bg-green-700">
                                <Save className="h-2.5 w-2.5 mr-1" />
                                Salva
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditTeam}
                                className="h-6 px-2">
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      team.groupId === 1
                                        ? "bg-blue-500"
                                        : "bg-green-500"
                                    }`}
                                  />
                                  <span className="font-semibold text-xs truncate">
                                    {team.teamName}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-0.5 ml-2.5">
                                  {team.player1 && (
                                    <div className="truncate">
                                      👤 {team.player1}
                                    </div>
                                  )}
                                  {team.player2 && (
                                    <div className="truncate">
                                      👤 {team.player2}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditTeam(team)}
                                className="h-5 w-5 p-0 shrink-0 text-muted-foreground hover:text-blue-600">
                                <Edit className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs mt-1.5 h-4 px-1">
                              {team.groupId === 1 ? "Girone A" : "Girone B"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* ── COLONNA DESTRA — Classifiche Gironi (sticky) ── */}
        <div className="w-full xl:w-80 2xl:w-96 shrink-0 space-y-3 xl:sticky xl:top-4">
          <h2 className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
            <Trophy className="h-3.5 w-3.5" />
            Classifiche Gironi
          </h2>

          {groups.map((group) => (
            <Card key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors rounded-t-xl">
                <span className="text-sm font-semibold">{group.name}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    collapsedGroups[group.id] ? "-rotate-90" : ""
                  }`}
                />
              </button>
              {!collapsedGroups[group.id] && (
                <CardContent className="px-4 pb-3 pt-0">
                  <div className="space-y-1">
                    {group.teams
                      .slice()
                      .sort(
                        (a, b) =>
                          b.points - a.points ||
                          b.setsWon - b.setsLost - (a.setsWon - a.setsLost),
                      )
                      .map((team, index) => {
                        const isGold = index < 2;
                        const isSilver = index === 2 || index === 3;
                        return (
                          <div
                            key={team.id}
                            className={`flex items-center gap-2 p-1.5 rounded border text-xs ${
                              isGold
                                ? "bg-yellow-50 border-yellow-200"
                                : isSilver
                                  ? "bg-gray-50 border-gray-200"
                                  : "bg-red-50/60 border-red-200"
                            }`}>
                            <span className="w-4 text-center font-bold text-muted-foreground shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium truncate block">
                                {team.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isGold ? (
                                <span className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded font-medium leading-none">
                                  G
                                </span>
                              ) : isSilver ? (
                                <span className="bg-gray-500 text-white text-xs px-1 py-0.5 rounded font-medium leading-none">
                                  S
                                </span>
                              ) : null}
                              <span className="bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                                {team.points}pt
                              </span>
                              <span className="text-muted-foreground">
                                {team.wins}V-{team.losses}S
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Legenda qualificazioni */}
          <Card className="border-dashed">
            <CardContent className="px-4 py-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-yellow-500 text-white px-1.5 py-0.5 rounded font-medium">
                    G
                  </span>
                  <span>
                    <strong>GOLD</strong> — Primi 2 di ogni girone
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-500 text-white px-1.5 py-0.5 rounded font-medium">
                    S
                  </span>
                  <span>
                    <strong>SILVER</strong> — 3° e 4° di ogni girone
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-muted-foreground">
                  <span>Partite completate</span>
                  <span className="font-semibold text-foreground">
                    {completedMatches}/{totalMatches}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {progressPercentage === 100 && (
                  <p className="text-green-700 font-medium text-center pt-1">
                    🎉 Fase gironi completata!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
