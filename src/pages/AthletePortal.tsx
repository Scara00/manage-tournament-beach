import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Search,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
} from "lucide-react";

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
  tournamentId: number;
}

interface Tournament {
  id: number;
  name: string;
  date: string;
  location: string;
  status: string;
  groups: Group[];
  matches: Match[];
}

// Mock data con multiple tournei
const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Torneo Estivo 2026",
    date: "2026-07-15",
    location: "Bagni Marco, Rimini",
    status: "Attivo",
    groups: [
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
    ],
    matches: [
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
    ],
  },
  {
    id: 2,
    name: "Beach Master Cup",
    date: "2026-08-20",
    location: "Lido di Jesolo",
    status: "Attivo",
    groups: [
      {
        id: 3,
        name: "Girone C",
        teams: [
          {
            id: 9,
            name: "Elite Sands",
            points: 4,
            matchesPlayed: 2,
            wins: 2,
            losses: 0,
            setsWon: 2,
            setsLost: 0,
          },
          {
            id: 10,
            name: "Ocean Legends",
            points: 2,
            matchesPlayed: 2,
            wins: 1,
            losses: 1,
            setsWon: 1,
            setsLost: 1,
          },
          {
            id: 3,
            name: "Sand Warriors",
            points: 0,
            matchesPlayed: 2,
            wins: 0,
            losses: 2,
            setsWon: 0,
            setsLost: 2,
          },
        ],
      },
    ],
    matches: [
      {
        id: 10,
        groupId: 3,
        team1Id: 9,
        team2Id: 10,
        team1Name: "Elite Sands",
        team2Name: "Ocean Legends",
        team1Score: 21,
        team2Score: 17,
        status: "completed",
        winner: 9,
      },
      {
        id: 11,
        groupId: 3,
        team1Id: 9,
        team2Id: 3,
        team1Name: "Elite Sands",
        team2Name: "Sand Warriors",
        team1Score: 21,
        team2Score: 12,
        status: "completed",
        winner: 9,
      },
      {
        id: 12,
        groupId: 3,
        team1Id: 10,
        team2Id: 3,
        team1Name: "Ocean Legends",
        team2Name: "Sand Warriors",
        status: "in-progress",
      },
    ],
  },
];

const mockRegisteredTeams: RegisteredTeam[] = [
  {
    id: 1,
    teamName: "Thunder Beach",
    player1: "Marco Rossi",
    player2: "Luca Bianchi",
    groupId: 1,
    tournamentId: 1,
  },
  {
    id: 2,
    teamName: "Wave Riders",
    player1: "Alessandro Verde",
    player2: "Francesco Neri",
    groupId: 1,
    tournamentId: 1,
  },
  {
    id: 3,
    teamName: "Sand Warriors",
    player1: "Giuseppe Silvestri",
    player2: "Antonio Gialli",
    groupId: 1,
    tournamentId: 1,
  },
  {
    id: 4,
    teamName: "Beach Kings",
    player1: "Roberto Blu",
    player2: "Stefano Viola",
    groupId: 1,
    tournamentId: 1,
  },
  {
    id: 5,
    teamName: "Volleyball Stars",
    player1: "Diego Rosa",
    player2: "Matteo Arancione",
    groupId: 2,
    tournamentId: 1,
  },
  {
    id: 6,
    teamName: "Coast Crushers",
    player1: "Fabio Grigio",
    player2: "Andrea Marrone",
    groupId: 2,
    tournamentId: 1,
  },
  {
    id: 7,
    teamName: "Sun Spikers",
    player1: "Paolo Azzurro",
    player2: "Simone Celeste",
    groupId: 2,
    tournamentId: 1,
  },
  {
    id: 8,
    teamName: "Seaside Smash",
    player1: "Carlo Indaco",
    player2: "Davide Turchese",
    groupId: 2,
    tournamentId: 1,
  },
  // Secondo torneo
  {
    id: 9,
    teamName: "Elite Sands",
    player1: "Marco Rossi",
    player2: "Simone Celeste",
    groupId: 3,
    tournamentId: 2,
  },
  {
    id: 10,
    teamName: "Ocean Legends",
    player1: "Giuseppe Silvestri",
    player2: "Andrea Marrone",
    groupId: 3,
    tournamentId: 2,
  },
  {
    id: 11,
    teamName: "Sand Warriors",
    player1: "Giuseppe Silvestri",
    player2: "Antonio Gialli",
    groupId: 3,
    tournamentId: 2,
  },
];

const getStatusBadge = (status: Match["status"]) => {
  switch (status) {
    case "scheduled":
      return (
        <Badge variant="outline" className="text-xs">
          Da Giocare
        </Badge>
      );
    case "in-progress":
      return (
        <Badge variant="default" className="text-xs">
          In Corso
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="secondary" className="text-xs">
          Completata
        </Badge>
      );
  }
};

export function AthletePortal() {
  const [surname, setSurname] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [athleteTeams, setAthleteTeams] = useState<RegisteredTeam[]>([]);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);

  const handleLogin = () => {
    if (!surname.trim()) {
      alert("Inserisci il tuo cognome");
      return;
    }

    const foundTeams = mockRegisteredTeams.filter(
      (team) =>
        team.player1?.toLowerCase().includes(surname.toLowerCase()) ||
        team.player2?.toLowerCase().includes(surname.toLowerCase()),
    );

    if (foundTeams.length > 0) {
      setAthleteTeams(foundTeams);
      setIsLoggedIn(true);
    } else {
      alert("Cognome non trovato. Controlla e riprova.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-linear-to-b from-blue-50 to-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Portale Atleti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Inserisci il tuo cognome per accedere al portale e visualizzare
                le tue informazioni
              </p>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Es: Rossi"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Accedi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedTournament) {
    // Mostra lista tornei a cui l'atleta partecipa
    const athleteTournaments = mockTournaments.filter((t) =>
      athleteTeams.some((team) => team.tournamentId === t.id),
    );

    return (
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold leading-tight">Portale Atleti</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Benvenuto,{" "}
              {athleteTeams[0]?.player1?.includes(
                surname.toUpperCase() || surname,
              )
                ? athleteTeams[0]?.player1
                : athleteTeams[0]?.player2}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoggedIn(false);
              setSurname("");
              setAthleteTeams([]);
            }}>
            Esci
          </Button>
        </div>

        {/* Lista Tornei */}
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold mb-4">I Tuoi Tornei</h2>
          <div className="space-y-3">
            {athleteTournaments.map((tournament) => {
              const userTeam = athleteTeams.find(
                (t) => t.tournamentId === tournament.id,
              );
              return (
                <Card
                  key={tournament.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div
                      onClick={() => setSelectedTournament(tournament)}
                      className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {tournament.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(tournament.date).toLocaleDateString(
                              "it-IT",
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {tournament.location}
                          </div>
                        </div>
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            {userTeam?.teamName}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Dettagli torneo selezionato
  const userTeam = athleteTeams.find(
    (t) => t.tournamentId === selectedTournament.id,
  );
  const userGroup = selectedTournament.groups.find(
    (g) => g.id === userTeam?.groupId,
  );
  const userTeamData = userGroup?.teams.find(
    (t) => t.name === userTeam?.teamName,
  );
  const userMatches = selectedTournament.matches.filter(
    (m) =>
      (m.team1Name === userTeam?.teamName ||
        m.team2Name === userTeam?.teamName) &&
      m.groupId === userTeam?.groupId,
  );
  const ranking =
    userGroup?.teams.slice().sort((a, b) => b.points - a.points) || [];

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedTournament(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna ai Tornei
        </Button>

        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {selectedTournament.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {userTeam?.teamName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sezione Principale */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                La Tua Squadra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nome Squadra</p>
                  <p className="text-lg font-bold">{userTeam?.teamName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Girone</p>
                  <p className="text-lg font-bold">{userGroup?.name}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-2">Atleti</p>
                <div className="space-y-1">
                  <p className="text-sm">👤 {userTeam?.player1}</p>
                  <p className="text-sm">👤 {userTeam?.player2}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partite */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Le Tue Partite
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessuna partita trovata
                </p>
              ) : (
                userMatches.map((match) => {
                  const isTeam1 = match.team1Name === userTeam?.teamName;
                  const opponent = isTeam1 ? match.team2Name : match.team1Name;
                  const myScore = isTeam1 ? match.team1Score : match.team2Score;
                  const oppScore = isTeam1
                    ? match.team2Score
                    : match.team1Score;
                  const isWinner =
                    match.winner === (isTeam1 ? match.team1Id : match.team2Id);

                  return (
                    <Card key={match.id} className="bg-gray-50/50">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">
                                {userTeam?.teamName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                vs {opponent}
                              </p>
                            </div>
                            <div className="text-right">
                              {match.status === "completed" &&
                              myScore !== undefined &&
                              oppScore !== undefined ? (
                                <div className="flex items-center justify-end gap-2">
                                  <div>
                                    <p
                                      className={`text-2xl font-bold ${isWinner ? "text-green-600" : "text-gray-400"}`}>
                                      {myScore}
                                    </p>
                                  </div>
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                  <div>
                                    <p
                                      className={`text-2xl font-bold ${!isWinner && match.winner ? "text-green-600" : "text-gray-400"}`}>
                                      {oppScore}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  --
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {userGroup?.name}
                            </p>
                            {getStatusBadge(match.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Classifica */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-4 w-4" />
                Classifica {userGroup?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ranking.map((team, index) => (
                  <div
                    key={team.id}
                    className={`p-2 rounded border text-xs ${
                      team.name === userTeam?.teamName
                        ? "bg-blue-50 border-blue-300 font-semibold"
                        : "bg-gray-50"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-bold mr-2">{index + 1}.</span>
                        {team.name}
                      </div>
                      <span className="font-semibold text-blue-600">
                        {team.points}pt
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {team.wins}V-{team.losses}S | {team.setsWon}:
                      {team.setsLost}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistiche */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Le Tue Statistiche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partite Giocate</span>
                <span className="font-semibold">
                  {userTeamData?.matchesPlayed ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vittorie</span>
                <span className="font-semibold text-green-600">
                  {userTeamData?.wins ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sconfitte</span>
                <span className="font-semibold text-red-600">
                  {userTeamData?.losses ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Set Vinti</span>
                <span className="font-semibold">
                  {userTeamData?.setsWon ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Set Persi</span>
                <span className="font-semibold">
                  {userTeamData?.setsLost ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
