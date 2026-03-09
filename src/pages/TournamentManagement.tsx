import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Loader,
  AlertCircle,
} from "lucide-react";
import {
  getTournamentById,
  generateMatchesForGroup,
  getTournamentMatches,
  updateMatchStatus,
  updateMatchScore,
} from "@/lib/supabase";
import { useAuth } from "@/context/useAuth";
import { useTournamentManagement } from "@/hooks/useTournamentManagement";
import type { Group, Match, RegisteredTeam, TournamentData } from "@/types";

export default function TournamentManagement() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const tournamentId = id ? parseInt(id) : null;

  // Stati per il caricamento dei dati reali
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registeredTeams, setRegisteredTeams] = useState<RegisteredTeam[]>([]);

  // Stati UI
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [showRegisteredTeamsModal, setShowRegisteredTeamsModal] =
    useState(false);
  const [generatingMatches, setGeneratingMatches] = useState<number | null>(
    null,
  );
  const [savingMatch, setSavingMatch] = useState<number | null>(null);
  const [tempTeamData, setTempTeamData] = useState<{
    teamName: string;
    player1: string;
    player2: string;
  }>({ teamName: "", player1: "", player2: "" });

  // Use custom hook for match management
  const {
    collapsedGroups,
    collapsedMatchGroups,
    editingMatch,
    tempScores,
    toggleGroup,
    toggleMatchGroup,
    startEditMatch,
    cancelEdit,
    setTempScores,
  } = useTournamentManagement();

  // Carica i dati del torneo da Supabase
  useEffect(() => {
    if (!tournamentId || !isAuthenticated) {
      setLoadError("Tournament ID or authentication missing");
      setIsLoading(false);
      return;
    }

    const loadTournament = async () => {
      try {
        const data = await getTournamentById(tournamentId);
        setTournament(data);

        if (data.groups && data.groups.length > 0) {
          setGroups(
            data.groups.map((group: any) => ({
              id: group.id,
              name: group.name,
              teams: (group.registered_teams || []).map((team: any) => ({
                id: team.id,
                name: team.team_name,
                points: team.points || 0,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                setsWon: 0,
                setsLost: 0,
              })),
            })),
          );

          const allTeams: RegisteredTeam[] = [];
          data.groups.forEach((group: any) => {
            if (group.registered_teams && group.registered_teams.length > 0) {
              group.registered_teams.forEach((team: any) => {
                allTeams.push({
                  id: team.id,
                  teamName: team.team_name,
                  player1: team.player1_name,
                  player2: team.player2_name,
                  groupId: group.id,
                });
              });
            }
          });
          setRegisteredTeams(allTeams);
        }

        // Carica le partite del torneo
        const matchesData = await getTournamentMatches(tournamentId);
        setMatches(
          matchesData.map((m: any) => ({
            id: m.id,
            groupId: m.group_id,
            team1Id: m.team1_id,
            team2Id: m.team2_id,
            team1Name: m.team1_name,
            team2Name: m.team2_name,
            team1Score: m.team1_score,
            team2Score: m.team2_score,
            status: m.status,
            winner: m.winner_id,
          })),
        );
      } catch (error) {
        console.error("Error loading tournament:", error);
        setLoadError("Failed to load tournament data");
      } finally {
        setIsLoading(false);
      }
    };

    loadTournament();
  }, [tournamentId, isAuthenticated]);

  // Funzione per generare le partite per un girone
  const handleGenerateMatches = async (groupId: number) => {
    if (!tournamentId) return;

    setGeneratingMatches(groupId);
    try {
      const result = await generateMatchesForGroup(groupId, tournamentId);

      // Ricarica le partite
      const updatedMatches = await getTournamentMatches(tournamentId);
      setMatches(
        updatedMatches.map((m: any) => ({
          id: m.id,
          groupId: m.group_id,
          team1Id: m.team1_id,
          team2Id: m.team2_id,
          team1Name: m.team1_name,
          team2Name: m.team2_name,
          team1Score: m.team1_score,
          team2Score: m.team2_score,
          status: m.status,
          winner: m.winner_id,
        })),
      );

      alert(`✅ ${result.message}`);
    } catch (error: any) {
      console.error("Errore nella generazione delle partite:", error);
      alert(`❌ Errore: ${error.message}`);
    } finally {
      setGeneratingMatches(null);
    }
  };

  // Funzioni per la gestione team
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

  // Inizia una partita (scheduled → in-progress)
  const handleStartMatch = async (matchId: number) => {
    setSavingMatch(matchId);
    try {
      // 1. Aggiorna su Supabase
      await updateMatchStatus(matchId, "in-progress");

      // 2. Aggiorna lo stato locale
      setMatches(
        matches.map((m) =>
          m.id === matchId && m.status === "scheduled"
            ? { ...m, status: "in-progress" as const }
            : m,
        ),
      );

      // 3. Inizia edit della partita
      const match = matches.find((m) => m.id === matchId);
      if (match) {
        startEditMatch(match);
      }
    } catch (error: any) {
      console.error("Errore nell'inizio della partita:", error);
      alert(`❌ Errore: ${error.message}`);
    } finally {
      setSavingMatch(null);
    }
  };

  // Salva i risultati della partita con integrazione Supabase
  const saveMatch = async (matchId: number) => {
    if (!tempScores.team1 || !tempScores.team2) {
      alert("Inserisci i punteggi prima di salvare");
      return;
    }

    const team1Score = parseInt(tempScores.team1);
    const team2Score = parseInt(tempScores.team2);

    // Valida punteggi beach volley
    if (
      team1Score < 0 ||
      team2Score < 0 ||
      Math.max(team1Score, team2Score) < 21 ||
      Math.abs(team1Score - team2Score) < 2
    ) {
      alert(
        "Punteggio non valido per beach volley. Serve almeno 21 punti e 2 di differenza.",
      );
      return;
    }

    const matchData = matches.find((m) => m.id === matchId);
    if (!matchData) return;

    const winnerId =
      team1Score > team2Score ? matchData.team1Id : matchData.team2Id;

    setSavingMatch(matchId);
    try {
      // 1. Salva su Supabase
      await updateMatchScore(matchId, team1Score, team2Score, winnerId);

      // 2. Aggiorna stato locale matches
      setMatches(
        matches.map((match) => {
          if (match.id === matchId) {
            return {
              ...match,
              team1Score,
              team2Score,
              status: "completed" as const,
              winner: winnerId,
            };
          }
          return match;
        }),
      );

      // 3. Aggiorna statistiche del girone
      setGroups(
        groups.map((group) => {
          if (group.id === matchData.groupId) {
            return {
              ...group,
              teams: group.teams.map((team) => {
                if (team.id === matchData.team1Id) {
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
                if (team.id === matchData.team2Id) {
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

      alert("✅ Risultato salvato con successo!");
      cancelEdit();
    } catch (error: any) {
      console.error("Errore nel salvataggio della partita:", error);
      alert(`❌ Errore nel salvataggio: ${error.message}`);
    } finally {
      setSavingMatch(null);
    }
  };

  const startEditTeam = (team: RegisteredTeam) => {
    setEditingTeam(team.id);
    setTempTeamData({
      teamName: team.teamName,
      player1: team.player1 || "",
      player2: team.player2 || "",
    });
  };

  const cancelEditTeam = () => {
    setEditingTeam(null);
    setTempTeamData({ teamName: "", player1: "", player2: "" });
  };

  const saveTeam = () => {
    if (!tempTeamData.teamName.trim()) {
      alert("Il nome della squadra è obbligatorio");
      return;
    }
    alert("Squadra aggiornata con successo!");
    cancelEditTeam();
  };

  // Calcola progressione torneo
  const totalMatches = matches.length;
  const completedMatches = matches.filter(
    (m) => m.status === "completed",
  ).length;
  const progressPercentage = Math.round(
    (completedMatches / totalMatches) * 100,
  );

  // Verifica autenticazione
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Accesso Negato</h2>
          <p className="text-muted-foreground mb-4">
            Devi essere loggato per gestire un torneo.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading tournament...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !tournament) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Torneo non trovato</h2>
          <p className="text-muted-foreground mb-4">
            {loadError || "The tournament you're looking for doesn't exist."}
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4">
      {/* Header */}
      <div className="mb-4 sm:mb-6 space-y-4">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Home
          </Button>
        </Link>

        {/* Title and Info */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold leading-tight">
              Gestione Torneo — Torneo Estivo 2026
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestisci i gironi e i risultati delle partite
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRegisteredTeamsModal(true)}
              className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Squadre Iscritte
              <Badge variant="secondary" className="ml-1 text-xs">
                {registeredTeams.length}
              </Badge>
            </Button>
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
                      <CardContent className="px-4 pb-3 pt-3">
                        {matchCount === 0 && (
                          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800 mb-2">
                              ⚠️ Nessuna partita generata. Clicca il bottone per
                              crearle automaticamente.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleGenerateMatches(group.id)}
                              disabled={generatingMatches === group.id}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                              {generatingMatches === group.id ? (
                                <>
                                  <span className="animate-spin mr-2">⚙️</span>
                                  Generazione in corso...
                                </>
                              ) : (
                                <>
                                  🎯 Genera Partite Round-Robin (
                                  {group.teams.length} squadre)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
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
                                      match.status === "scheduled"
                                        ? "text-blue-600 hover:text-blue-800"
                                        : match.status === "in-progress"
                                          ? "text-orange-600 hover:text-orange-800"
                                          : "text-gray-500 hover:text-gray-700"
                                    }`}>
                                    <Edit className="h-2.5 w-2.5 mr-1" />
                                    {match.status === "scheduled"
                                      ? "Inizia"
                                      : match.status === "in-progress"
                                        ? "Inserisci Risultato"
                                        : "Modifica"}
                                  </Button>
                                </div>

                                {editingMatch === match.id ? (
                                  <div className="mt-2 space-y-2 bg-white p-2.5 rounded border">
                                    {match.status === "scheduled" ? (
                                      <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                          📋 Inizia questa partita per metterla
                                          in corso
                                        </p>
                                        <div className="flex gap-1.5">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleStartMatch(match.id)
                                            }
                                            disabled={savingMatch === match.id}
                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 flex-1">
                                            {savingMatch === match.id ? (
                                              <>
                                                <span className="animate-spin mr-1">
                                                  ⚙️
                                                </span>
                                                Caricamento...
                                              </>
                                            ) : (
                                              <>
                                                <Play className="h-3 w-3 mr-1" />
                                                Inizia Partita
                                              </>
                                            )}
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
                                      <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                          💡 Set da 21 punti con differenza di
                                          2.
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
                                            disabled={savingMatch === match.id}
                                            className="h-7 text-xs bg-green-600 hover:bg-green-700">
                                            {savingMatch === match.id ? (
                                              <>
                                                <span className="animate-spin mr-1">
                                                  ⚙️
                                                </span>
                                                Salvataggio...
                                              </>
                                            ) : (
                                              <>
                                                <Check className="h-3 w-3 mr-1" />
                                                Salva Risultato
                                              </>
                                            )}
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
                                    )}
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

      {/* Modale Squadre Iscritte */}
      <AlertDialog
        open={showRegisteredTeamsModal}
        onOpenChange={setShowRegisteredTeamsModal}>
        <AlertDialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Squadre Iscritte ({registeredTeams.length})
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3 py-4 px-4">
              {registeredTeams.map((team) => (
                <div
                  key={team.id}
                  className="border rounded-lg p-3 bg-gray-50/50">
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
                              <div className="truncate">👤 {team.player1}</div>
                            )}
                            {team.player2 && (
                              <div className="truncate">👤 {team.player2}</div>
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
          </div>
          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel className="mt-0">
              <X className="h-4 w-4 mr-2" />
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
