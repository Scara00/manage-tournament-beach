import { useEffect, useState } from "react";
import { AlertCircle, Users, MapPin, Calendar, Loader } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { RegisterTeamModal } from "../components/RegisterTeamModal";
import { getTournamentsWithTeamCount } from "../lib/supabase";
import {
  sortTournamentsByStatus,
  getStatusConfig,
} from "../lib/tournament-status";
import type { Tournament } from "../types";

export function BrowseTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTournamentsWithTeamCount();
      setTournaments(data);
    } catch (err) {
      setError("Failed to load tournaments");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowModal(true);
  };

  const handleRegistrationSuccess = () => {
    fetchTournaments();
  };

  const getAvailableSpots = (tournament: Tournament) => {
    const available =
      (tournament.max_participants ?? 0) - (tournament.participants || 0);
    return Math.max(0, available);
  };

  const isDeadlinePassed = (tournament: Tournament) => {
    if (!tournament.registration_deadline) return false;
    return new Date(tournament.registration_deadline) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  const groupedTournaments = sortTournamentsByStatus(tournaments);
  const statusOrder = ["In Preparazione", "In Corso", "Attivo", "Completato"];

  const renderTournamentCard = (tournament: Tournament) => {
    const availableSpots = getAvailableSpots(tournament);
    const deadlinePassed = isDeadlinePassed(tournament);
    const statusConfig = getStatusConfig(
      tournament.status || "In Preparazione",
    );

    return (
      <Card
        key={tournament.id}
        className={`p-3 sm:p-4 hover:shadow-lg transition-shadow border-l-4 ${statusConfig.color.border} h-full`}>
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {statusConfig.icon}
              <h2 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                {tournament.name}
              </h2>
            </div>
            <Badge
              className={`${statusConfig.color.badge} ${statusConfig.color.badgeText} text-xs mb-1 inline-block`}>
              {statusConfig.label}
            </Badge>
          </div>
          <div className="text-right flex-shrink-0">
            <div
              className={`text-lg sm:text-xl font-bold ${statusConfig.color.text}`}>
              {availableSpots}
            </div>
            <p className="text-xs text-gray-500">posti</p>
          </div>
        </div>

        {tournament.category && (
          <p className="text-xs text-gray-500 mb-1">{tournament.category}</p>
        )}

        {tournament.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
            {tournament.description}
          </p>
        )}

        <div className="space-y-1 mb-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatDate(tournament.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">{tournament.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span>
              {tournament.participants || 0}/
              {tournament.max_participants || "—"}
            </span>
          </div>
        </div>

        {tournament.entry_fee && (
          <div className="mb-2 p-1.5 bg-gray-50 rounded text-center">
            <p className="text-xs text-gray-600">Quota</p>
            <p className="text-base font-bold text-gray-900">
              €{tournament.entry_fee}
            </p>
          </div>
        )}

        {tournament.registration_deadline && (
          <div className="mb-2 text-xs text-gray-500 border-t pt-1">
            Scadenza: {formatDate(tournament.registration_deadline)}
          </div>
        )}

        <Button
          onClick={() => handleRegisterClick(tournament)}
          disabled={availableSpots === 0 || deadlinePassed}
          className="w-full">
          {deadlinePassed
            ? "Registrazione Chiusa"
            : availableSpots === 0
              ? "Completo"
              : "Registra Squadra"}
        </Button>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tornei Disponibili
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Registra la tua squadra per competere nei tornei di beach volley
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                onClick={fetchTournaments}
                className="text-sm text-red-700 hover:text-red-600 mt-1 underline">
                Riprova
              </button>
            </div>
          </div>
        )}

        {tournaments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              Nessun torneo disponibile al momento.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Controlla di nuovo tra poco!
            </p>
          </Card>
        ) : (
          <div className="space-y-12">
            {statusOrder.map((status, index) => {
              const statusTournaments = groupedTournaments[status] || [];
              if (statusTournaments.length === 0) return null;

              const statusConfig = getStatusConfig(status);

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
                      {renderTournamentCard(statusTournaments[0])}
                    </div>
                  ) : (
                    <Carousel className="w-full" opts={{ align: "start" }}>
                      <CarouselContent>
                        {statusTournaments.map((tournament) => (
                          <CarouselItem
                            key={tournament.id}
                            className="basis-full md:basis-1/2 lg:basis-1/2 xl:basis-1/3">
                            {renderTournamentCard(tournament)}
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedTournament && (
        <RegisterTeamModal
          tournamentId={selectedTournament.id}
          tournamentName={selectedTournament.name}
          onSuccess={handleRegistrationSuccess}
          onClose={() => {
            setShowModal(false);
            setSelectedTournament(null);
          }}
        />
      )}
    </div>
  );
}
