import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Trophy, Users, ArrowLeft } from "lucide-react";
import { getStatusBadge } from "@/lib/badge-utils";
import type { TeamData, MatchData, GroupData } from "@/types";

interface AthleteTournamentDetailProps {
  tournament: any;
  userTeam: any;
  userGroup?: GroupData;
  userTeamData?: TeamData;
  userMatches: MatchData[];
  ranking: TeamData[];
  onBackClick: () => void;
}

export function AthleteTournamentDetail({
  tournament,
  userTeam,
  userGroup,
  userTeamData,
  userMatches,
  ranking,
  onBackClick,
}: AthleteTournamentDetailProps) {
  if (!userGroup || !userTeamData) {
    return (
      <div className="min-h-screen p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna ai Tornei
        </Button>
        <div className="text-center py-12">
          <p className="text-red-600">Dati del torneo non disponibili</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={onBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna ai Tornei
        </Button>

        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {tournament.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {userTeam?.team_name}
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
                  <p className="text-lg font-bold">{userTeam?.team_name}</p>
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
                  <p className="text-sm">👤 {userTeam?.player1_name}</p>
                  <p className="text-sm">👤 {userTeam?.player2_name}</p>
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
                  const isTeam1 = match.team1_name === userTeam?.team_name;
                  const opponent = isTeam1
                    ? match.team2_name
                    : match.team1_name;
                  const myScore = isTeam1
                    ? match.team1_score
                    : match.team2_score;
                  const oppScore = isTeam1
                    ? match.team2_score
                    : match.team1_score;
                  const isWinner =
                    match.winner_id ===
                    (isTeam1 ? match.team1_id : match.team2_id);

                  return (
                    <Card key={match.id} className="bg-gray-50/50">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">
                                {userTeam?.team_name}
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
                                  <p
                                    className={`text-2xl font-bold ${isWinner ? "text-green-600" : "text-gray-400"}`}>
                                    {myScore}
                                  </p>
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                  <p
                                    className={`text-2xl font-bold ${!isWinner && match.winner_id ? "text-green-600" : "text-gray-400"}`}>
                                    {oppScore}
                                  </p>
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

        {/* Sidebar */}
        <div>
          {/* Classifica */}
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
                      team.team_name === userTeam?.team_name
                        ? "bg-blue-50 border-blue-300 font-semibold"
                        : "bg-gray-50"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-bold mr-2">{index + 1}.</span>
                        {team.team_name}
                      </div>
                      <span className="font-semibold text-blue-600">
                        {team.points}pt
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {team.wins}V-{team.losses}S | {team.sets_won}:
                      {team.sets_lost}
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
                  {userTeamData?.matches_played ?? 0}
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
                  {userTeamData?.sets_won ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Set Persi</span>
                <span className="font-semibold">
                  {userTeamData?.sets_lost ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
