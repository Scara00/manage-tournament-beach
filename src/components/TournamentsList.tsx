import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Calendar,
  Users,
  ChevronRight,
  Trophy,
  MapPin,
  LogOut,
} from "lucide-react";
import {
  sortTournamentsByStatus,
  getStatusConfig,
} from "@/lib/tournament-status";

interface TournamentItem {
  id: number;
  name: string;
  date: string;
  location: string;
  status?: string;
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
  const groupedTournaments = sortTournamentsByStatus(tournaments);
  const statusOrder = ["In Preparazione", "In Corso", "Attivo", "Completato"];

  const renderTournamentCard = (tournament: TournamentItem) => {
    const userTeam = userTeams.find((t) => t.tournament.id === tournament.id);
    const tournamentDate = new Date(tournament.date);
    const statusConfig = getStatusConfig(
      tournament.status || "In Preparazione",
    );

    return (
      <Card
        key={tournament.id}
        className={`hover:shadow-lg transition-all duration-200 border-l-4 ${statusConfig.color.border} cursor-pointer group h-full`}
        onClick={() => onSelectTournament(tournament.id)}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {statusConfig.icon}
              <h3 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                {tournament.name}
              </h3>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 flex-shrink-0 transition-colors" />
          </div>

          <Badge
            className={`${statusConfig.color.badge} ${statusConfig.color.badgeText} mb-2 text-xs inline-block`}>
            {statusConfig.label}
          </Badge>

          {/* Details Grid */}
          <div className="space-y-1 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 flex-shrink-0 text-blue-600" />
              <span className="truncate">
                {tournamentDate.toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 flex-shrink-0 text-red-600" />
              <span className="truncate">{tournament.location}</span>
            </div>
          </div>

          {/* Team Badge */}
          {userTeam && (
            <div className="flex items-center gap-2 pt-1 border-t mt-2">
              <Users className="h-3 w-3 text-green-600" />
              <Badge variant="secondary" className="text-xs font-medium">
                {userTeam.team_name}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-8 w-8" />
                <h1 className="text-2xl sm:text-4xl font-bold">
                  Portale Atleti
                </h1>
              </div>
              <p className="text-blue-100 text-sm sm:text-base">
                Benvenuto, <span className="font-semibold">{athleteName}</span>{" "}
                👋
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onLogout}
              className="text-xs sm:text-sm white">
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tornei
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {tournaments.length}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Le Tue Squadre
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {userTeams.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm col-span-2 sm:col-span-1">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tornei Attivi
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {(groupedTournaments["In Corso"] || []).length +
                      (groupedTournaments["Attivo"] || []).length}
                  </p>
                </div>
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments Section by Status */}
        <div>
          {tournaments.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium mb-2">
                  Nessun torneo trovato
                </p>
                <p className="text-xs text-muted-foreground">
                  Controllare più tardi per i prossimi tornei
                </p>
              </CardContent>
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

        {/* Footer Info */}
        {tournaments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Clicca su un torneo per visualizzare i dettagli e seguire le tue
              partite
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
