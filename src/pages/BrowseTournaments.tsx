import { useEffect, useState } from "react";
import { AlertCircle, Users, MapPin, Calendar, Loader } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { RegisterTeamModal } from "../components/RegisterTeamModal";
import { getTournamentsWithTeamCount } from "../lib/supabase";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Available Tournaments
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Register your team to compete in beach volleyball tournaments
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
                Try again
              </button>
            </div>
          </div>
        )}

        {tournaments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              No tournaments available at the moment.
            </p>
            <p className="text-gray-400 text-sm mt-2">Check back soon!</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {tournaments.map((tournament) => {
              const availableSpots = getAvailableSpots(tournament);
              const deadlinePassed = isDeadlinePassed(tournament);

              return (
                <Card
                  key={tournament.id}
                  className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 line-clamp-2">
                        {tournament.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {tournament.category}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {availableSpots}
                      </div>
                      <p className="text-xs text-gray-500">spots left</p>
                    </div>
                  </div>

                  {tournament.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(tournament.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{tournament.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>
                        {tournament.participants || 0}/
                        {tournament.max_participants || "—"}
                      </span>
                    </div>
                    {tournament.entry_fee && (
                      <div className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">
                          €{tournament.entry_fee}
                        </span>
                      </div>
                    )}
                  </div>

                  {tournament.registration_deadline && (
                    <div className="mb-4 text-xs sm:text-sm text-gray-500">
                      Registration deadline:{" "}
                      {formatDate(tournament.registration_deadline)}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleRegisterClick(tournament)}
                      disabled={availableSpots === 0 || deadlinePassed}
                      className="flex-1">
                      {deadlinePassed
                        ? "Registration Closed"
                        : availableSpots === 0
                          ? "Full"
                          : "Register Team"}
                    </Button>
                  </div>
                </Card>
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
