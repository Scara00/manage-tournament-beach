import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  MapPin,
  Euro,
  Settings,
  Loader,
} from "lucide-react";
import { getTournamentById } from "@/lib/supabase";
import { useAuth } from "@/context/useAuth";
import { TournamentBrackets } from "@/components/TournamentBrackets";
import { KnockoutMatchEditor } from "@/components/KnockoutMatchEditor";
import type { Tournament } from "@/types";

export function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "brackets">(
    "overview",
  );

  const tournamentId = id ? parseInt(id) : null;

  useEffect(() => {
    if (!tournamentId) {
      setError("Invalid tournament ID");
      setIsLoading(false);
      return;
    }

    const fetchTournament = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTournamentById(tournamentId);
        setTournament(data);
      } catch (err) {
        console.error("Error loading tournament:", err);
        setError("Failed to load tournament details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

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

  if (error || !tournament) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Torneo non trovato</h2>
          <p className="text-muted-foreground mb-4">
            {error ||
              "Il torneo che stai cercando non esiste o è stato rimosso."}
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

  const totalParticipants =
    tournament.groups?.reduce(
      (sum, group) => sum + (group.registered_teams?.length || 0),
      0,
    ) || 0;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Attivo":
        return "default";
      case "Completato":
        return "secondary";
      case "In Preparazione":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant={getStatusBadgeVariant(tournament.status)}
                  className="text-xs sm:text-sm">
                  {tournament.status}
                </Badge>
              </div>
            </div>
            {isAuthenticated &&
              user &&
              tournament.created_by === user.id &&
              (tournament.status === "In Preparazione" ||
                tournament.status === "Attivo") && (
                <Link
                  to={`/tournament/${tournament.id}/manage`}
                  className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto text-xs sm:text-sm">
                    <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Gestisci Torneo
                  </Button>
                </Link>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Informazioni Generali
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">
                        Data del Torneo
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(tournament.date).toLocaleDateString("it-IT", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Luogo</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {tournament.location}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        Categoria
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {tournament.category}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        Partecipanti
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {totalParticipants} / {tournament.max_participants}{" "}
                        iscritti
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        Quota di Iscrizione
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        €{tournament.entry_fee || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tournament.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Descrizione
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      {tournament.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {tournament.groups && tournament.groups.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Gironi e Squadre Iscritte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    {tournament.groups.map((group) => (
                      <div key={group.id} className="space-y-2 sm:space-y-3">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">
                            {group.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {group.registered_teams?.length || 0} squadre
                            iscritte
                          </p>
                        </div>

                        {group.registered_teams &&
                        group.registered_teams.length > 0 ? (
                          <div className="space-y-2 bg-gray-50 p-3 sm:p-4 rounded-lg">
                            {group.registered_teams.map((team: any) => (
                              <div
                                key={team.id}
                                className="flex justify-between items-start bg-white p-2 sm:p-3 rounded border border-gray-200 gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs sm:text-sm truncate">
                                    {team.team_name}
                                  </p>
                                  {(team.player1_name || team.player2_name) && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {[team.player1_name, team.player2_name]
                                        .filter(Boolean)
                                        .join(" • ")}
                                    </p>
                                  )}
                                </div>
                                {team.points !== undefined && (
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm sm:text-base font-semibold">
                                      {team.points}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      punti
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Nessuna squadra iscritta a questo girone
                          </p>
                        )}

                        <Separator className="my-4" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bracket e Risultati</CardTitle>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                          activeTab === "overview"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}>
                        Visualizza
                      </button>
                      <button
                        onClick={() => setActiveTab("brackets")}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                          activeTab === "brackets"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}>
                        Modifica
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTab === "overview" ? (
                    <div>
                      {tournamentId && (
                        <TournamentBrackets tournamentId={tournamentId} />
                      )}
                    </div>
                  ) : (
                    <div>
                      {tournamentId && (
                        <KnockoutMatchEditor tournamentId={tournamentId} />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    Stato del Torneo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Struttura Torneo</p>
                    {tournament.structure ? (
                      <p className="text-sm text-muted-foreground">
                        {tournament.structure}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nessuna struttura definita
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium mb-1">
                      Scadenza Iscrizioni
                    </p>
                    {tournament.registration_deadline ? (
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          tournament.registration_deadline,
                        ).toLocaleDateString("it-IT")}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Non specificata
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {tournament.status === "In Preparazione" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">
                      Iscrizione
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to="/join" className="block">
                      <Button className="w-full text-xs sm:text-sm" size="sm">
                        Iscriviti al Torneo
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Posti disponibili:{" "}
                      {Math.max(
                        0,
                        (tournament.max_participants ?? 0) - totalParticipants,
                      )}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
