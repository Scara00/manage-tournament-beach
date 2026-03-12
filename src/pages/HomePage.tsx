import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Calendar, Trophy, Users, AlertCircle, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { getTournamentsWithTeamCount } from "@/lib/supabase";
import {
  sortTournamentsByStatus,
  getStatusConfig,
} from "@/lib/tournament-status";
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
    <div className="min-h-screen bg-background">
      {!isAuthenticated ? (
        <LoginForm />
      ) : (
        <>
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Gestione Tornei Beach Volley
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
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
                <p className="text-sm sm:text-base text-muted-foreground">
                  Caricamento tornei...
                </p>
              </div>
            ) : (
              <>
                {tournaments.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nessun torneo ancora
                    </h3>
                    <p className="text-muted-foreground">
                      Crea il tuo primo torneo di beach volley per iniziare
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {(() => {
                      const grouped = sortTournamentsByStatus(tournaments);
                      const statusOrder = [
                        "In Preparazione",
                        "In Corso",
                        "Attivo",
                        "Completato",
                      ];
                      const displayStatuses = statusOrder.filter(
                        (status) => (grouped[status] || []).length > 0,
                      );

                      return displayStatuses.length > 0
                        ? displayStatuses.map((status, index) => {
                            const statusTournaments = grouped[status] || [];
                            const statusConfig = getStatusConfig(status);

                            const renderCard = (tournament: Tournament) => (
                              <Card
                                key={tournament.id}
                                className={`hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${statusConfig.color.border} h-full`}>
                                <CardHeader className="pb-1 sm:pb-2">
                                  <div className="flex justify-between items-start gap-1">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      {statusConfig.icon}
                                      <CardTitle className="text-sm sm:text-base line-clamp-1">
                                        {tournament.name}
                                      </CardTitle>
                                    </div>
                                    <Badge
                                      className={`${statusConfig.color.badge} ${statusConfig.color.badgeText} text-xs flex-shrink-0`}>
                                      {statusConfig.label}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="mr-1.5 h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {new Date(
                                          tournament.date,
                                        ).toLocaleDateString("it-IT", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Users className="mr-1.5 h-3 w-3 flex-shrink-0" />
                                      <span>
                                        {tournament.participants} part.
                                      </span>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Trophy className="mr-1.5 h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {tournament.location}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-0.5 text-xs pt-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs">
                                        {tournament.category}
                                      </Badge>
                                      {(tournament.status === "Attivo" ||
                                        tournament.status === "In Corso") && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs">
                                          {tournament.structure}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-1 pt-1">
                                      <Link
                                        to={`/tournament/${tournament.id}`}
                                        className="w-full">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full text-xs h-7">
                                          Dettagli
                                        </Button>
                                      </Link>
                                      {(tournament.status === "Attivo" ||
                                        tournament.status === "In Corso") && (
                                        <Link
                                          to={`/tournament/${tournament.id}/manage`}
                                          className="w-full">
                                          <Button
                                            size="sm"
                                            className="w-full text-xs h-7">
                                            Gestisci
                                          </Button>
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );

                            return (
                              <div
                                key={status}
                                className={`${index > 0 ? "pt-8 sm:pt-12 border-t" : ""}`}>
                                {/* Section Header */}
                                <div className="flex items-center gap-3 mb-6">
                                  {statusConfig.icon}
                                  <div>
                                    <h2 className="text-xl font-bold">
                                      {statusConfig.label}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                      {statusConfig.description}
                                    </p>
                                  </div>
                                  <div className="ml-auto">
                                    <Badge
                                      className={`${statusConfig.color.badge} ${statusConfig.color.badgeText}`}>
                                      {statusTournaments.length}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Carousel or Grid */}
                                {statusTournaments.length === 1 ? (
                                  <div className="grid grid-cols-1">
                                    {renderCard(statusTournaments[0])}
                                  </div>
                                ) : (
                                  <Carousel
                                    className="w-full"
                                    opts={{ align: "start" }}>
                                    <CarouselContent>
                                      {statusTournaments.map((tournament) => (
                                        <CarouselItem
                                          key={tournament.id}
                                          className="basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3">
                                          {renderCard(tournament)}
                                        </CarouselItem>
                                      ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                  </Carousel>
                                )}
                              </div>
                            );
                          })
                        : null;
                    })()}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
