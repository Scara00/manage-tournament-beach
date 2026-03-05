import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, AlertCircle, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { getTournamentsWithTeamCount } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Tournament } from "@/types";

// Mock data per ora - poi saranno sostituiti da dati reali
const mockTournaments = [
  {
    id: 1,
    name: "Torneo Estivo 2026",
    date: "2026-07-15",
    participants: 16,
    status: "Attivo",
    location: "Bagni Marco, Rimini",
    category: "2x2 Misto",
    structure: "4 gironi → Gold/Silver",
  },
  {
    id: 2,
    name: "Beach Master Cup",
    date: "2026-08-20",
    participants: 32,
    status: "Completato",
    location: "Lido di Jesolo",
    category: "2x2 Maschile",
    structure: "Completato",
  },
  {
    id: 3,
    name: "Championship Series",
    date: "2026-09-10",
    participants: 8,
    status: "In Preparazione",
    location: "Viareggio Beach",
    category: "2x2 Femminile",
    structure: "2 gironi → Gold/Silver",
  },
];

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

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tournaments from Supabase
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTournaments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTournamentsWithTeamCount();
        setTournaments(data);
      } catch (err: any) {
        console.error("Error fetching tournaments:", err);
        // Fall back to mock data on error
        setTournaments(mockTournaments);
        setError("Errore nel caricamento dei tornei. Mostrando dati demo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [isAuthenticated]);

  return (
    <div className="container mx-auto p-6">
      {!isAuthenticated ? (
        <LoginForm />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Gestione Tornei Beach Volley
            </h1>
            <p className="text-muted-foreground mt-2">
              Organizza e gestisci i tuoi tornei di beach volley
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-muted-foreground">Caricamento tornei...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                  <Card
                    key={tournament.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {tournament.name}
                        </CardTitle>
                        <Badge
                          variant={getStatusBadgeVariant(tournament.status)}>
                          {tournament.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(tournament.date).toLocaleDateString(
                            "it-IT",
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          {tournament.participants} partecipanti
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Trophy className="mr-2 h-4 w-4" />
                          {tournament.location}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline" className="text-xs">
                            {tournament.category}
                          </Badge>
                          {tournament.status === "Attivo" && (
                            <Badge variant="secondary" className="text-xs">
                              {tournament.structure}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Link
                            to={`/tournament/${tournament.id}`}
                            className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full">
                              Dettagli
                            </Button>
                          </Link>
                          {tournament.status === "Attivo" && (
                            <Link
                              to={`/tournament/${tournament.id}/manage`}
                              className="flex-1">
                              <Button size="sm" className="w-full">
                                Gestisci
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {tournaments.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nessun torneo ancora
                  </h3>
                  <p className="text-muted-foreground">
                    Crea il tuo primo torneo di beach volley per iniziare
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
