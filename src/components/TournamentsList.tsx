import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ChevronRight } from "lucide-react";

interface TournamentItem {
  id: number;
  name: string;
  date: string;
  location: string;
}

interface TournamentsListProps {
  tournaments: TournamentItem[];
  userTeams: any[];
  onSelectTournament: (tournamentId: number) => void;
  onLogout: () => void;
  athleteName: string;
}

export function TournamentsList({
  tournaments,
  userTeams,
  onSelectTournament,
  onLogout,
  athleteName,
}: TournamentsListProps) {
  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight">Portale Atleti</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Benvenuto, {athleteName}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onLogout}>
          Esci
        </Button>
      </div>

      {/* Lista Tornei */}
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">I Tuoi Tornei</h2>
        {tournaments.length === 0 ? (
          <p className="text-muted-foreground">Nessun torneo trovato.</p>
        ) : (
          <div className="space-y-3">
            {tournaments.map((tournament) => {
              const userTeam = userTeams.find(
                (t) => t.tournament.id === tournament.id,
              );
              return (
                <Card
                  key={tournament.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectTournament(tournament.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
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
                            {userTeam?.team_name}
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
        )}
      </div>
    </div>
  );
}
