import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";

// Mock data per ora - poi saranno sostituiti da dati reali
const mockTournamentData = {
  1: {
    id: 1,
    name: "Torneo Estivo 2026",
    date: "2026-07-15",
    participants: 16,
    maxParticipants: 32,
    status: "Attivo",
    location: "Bagni Marco, Rimini",
    category: "2x2 Misto",
    description:
      "Il torneo estivo più atteso dell'anno! Sfida i migliori team di beach volley della riviera romagnola in una competizione mozzafiato.",
    entryFee: 25,
    structure: {
      groups: 4,
      teamsPerGroup: 4,
      phases: { gold: 8, silver: 8 },
      description:
        "4 gironi da 4 squadre. Fase Gold (8 squadre) e Silver (8 squadre).",
    },
    registrationDeadline: "2026-07-10",
    prizes: ["Trophy + 500€", "200€", "100€"],
  },
  2: {
    id: 2,
    name: "Beach Master Cup",
    date: "2026-08-20",
    participants: 32,
    maxParticipants: 32,
    status: "Completato",
    location: "Lido di Jesolo",
    category: "2x2 Maschile",
    description:
      "La coppa dei maestri del beach volley. Tournament completato con grande successo!",
    entryFee: 30,
    structure: {
      groups: 6,
      teamsPerGroup: 6,
      phases: { gold: 12, silver: 12, bronze: 8 },
      description:
        "6 gironi da 6 squadre. Fase Gold (12 squadre), Silver (12 squadre) e Bronze (8 squadre).",
    },
    registrationDeadline: "2026-08-15",
    prizes: ["Trophy + 800€", "400€", "200€"],
  },
  3: {
    id: 3,
    name: "Championship Series",
    date: "2026-09-10",
    participants: 8,
    maxParticipants: 16,
    status: "In Preparazione",
    location: "Viareggio Beach",
    category: "2x2 Femminile",
    description:
      "Serie di campionati professionali per determinare il miglior team della stagione.",
    entryFee: 40,
    structure: {
      groups: 2,
      teamsPerGroup: 4,
      phases: { gold: 4, silver: 4 },
      description:
        "2 gironi da 4 squadre. Fase Gold (4 squadre) e Silver (4 squadre).",
    },
    registrationDeadline: "2026-09-05",
    prizes: ["Trophy + 1000€", "500€", "250€"],
  },
};

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

export function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const tournamentId = id ? parseInt(id) : null;

  if (
    !tournamentId ||
    !mockTournamentData[tournamentId as keyof typeof mockTournamentData]
  ) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Torneo non trovato</h2>
          <p className="text-muted-foreground mb-4">
            Il torneo che stai cercando non esiste o è stato rimosso.
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

  const tournament =
    mockTournamentData[tournamentId as keyof typeof mockTournamentData];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Home
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {tournament.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={getStatusBadgeVariant(tournament.status)}>
                {tournament.status}
              </Badge>
            </div>
          </div>
          {tournament.status === "Attivo" && (
            <Link to={`/tournament/${tournament.id}/manage`}>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Gestisci Torneo
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Generali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Data del Torneo</p>
                    <p className="text-sm text-muted-foreground">
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

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Luogo</p>
                    <p className="text-sm text-muted-foreground">
                      {tournament.location}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Categoria</p>
                    <Badge variant="outline" className="mt-1">
                      {tournament.category}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Partecipanti</p>
                    <p className="text-sm text-muted-foreground">
                      {tournament.participants} / {tournament.maxParticipants}{" "}
                      iscritti
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Quota di Iscrizione</p>
                    <p className="text-sm text-muted-foreground">
                      €{tournament.entryFee}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descrizione</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {tournament.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bracket e Risultati</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="mx-auto h-12 w-12 mb-4" />
                  <p>Il bracket del torneo sarà disponibile qui</p>
                  <p className="text-sm mt-1">Feature in sviluppo</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dettagli Torneo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Struttura Torneo</p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {tournament.structure.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                        <div className="text-xs font-semibold text-yellow-800">
                          🥇 GOLD
                        </div>
                        <div className="text-xs text-yellow-700">
                          {tournament.structure.phases.gold} squadre
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded border border-gray-200">
                        <div className="text-xs font-semibold text-gray-800">
                          🥈 SILVER
                        </div>
                        <div className="text-xs text-gray-700">
                          {tournament.structure.phases.silver} squadre
                        </div>
                      </div>
                      {tournament.structure.phases.bronze && (
                        <div className="bg-orange-50 p-2 rounded border border-orange-200 col-span-2">
                          <div className="text-xs font-semibold text-orange-800">
                            🥉 BRONZE
                          </div>
                          <div className="text-xs text-orange-700">
                            {tournament.structure.phases.bronze} squadre
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">
                    Scadenza Iscrizioni
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      tournament.registrationDeadline,
                    ).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Premi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tournament.prizes.map((prize, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {index + 1}°
                        </span>
                      </div>
                      <p className="text-sm">{prize}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {tournament.status === "In Preparazione" && (
              <Card>
                <CardHeader>
                  <CardTitle>Iscrizione</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    Iscriviti al Torneo
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Posti disponibili:{" "}
                    {tournament.maxParticipants - tournament.participants}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
