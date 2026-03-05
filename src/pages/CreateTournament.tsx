import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Save, Info, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { createTournament, createGroup, getCurrentUser } from "@/lib/supabase";
import type { TournamentStructure } from "@/types";

export function CreateTournament() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    maxParticipants: "16",
    registrationDeadline: "",
    entryFee: "",
    category: "2x2 Misto",
  });

  // Calcola la struttura del torneo basata sul numero di partecipanti
  const calculateTournamentStructure = (
    numTeams: number,
  ): TournamentStructure | null => {
    if (numTeams < 4) return null;

    let groups = 0;
    let teamsPerGroup = 0;

    if (numTeams <= 8) {
      groups = 2;
      teamsPerGroup = Math.ceil(numTeams / 2);
    } else if (numTeams <= 12) {
      groups = 3;
      teamsPerGroup = 4;
    } else if (numTeams <= 16) {
      groups = 4;
      teamsPerGroup = 4;
    } else if (numTeams <= 20) {
      groups = 4;
      teamsPerGroup = 5;
    } else if (numTeams <= 24) {
      groups = 4;
      teamsPerGroup = 6;
    } else {
      groups = Math.ceil(numTeams / 6);
      teamsPerGroup = Math.ceil(numTeams / groups);
    }

    // Calcola quante squadre avanzano da ogni girone alle fasi finali
    // Massimo 2 squadre per girone possono avanzare a Gold
    const playersPerGroupGold = Math.min(2, teamsPerGroup);
    // Solo se il girone ha 3+ squadre, possono avanzare 3° e 4°
    const playersPerGroupSilver = Math.max(0, Math.min(2, teamsPerGroup - 2));

    const goldTeams = playersPerGroupGold * groups;
    const silverTeams = playersPerGroupSilver * groups;
    const bronzeTeams = numTeams - goldTeams - silverTeams;

    let description = `${groups} gironi da ${teamsPerGroup} squadre. `;

    if (bronzeTeams <= 0) {
      description += `Fase Gold (${goldTeams} squadre)${silverTeams > 0 ? ` e Silver (${silverTeams} squadre)` : ""}.`;
      return {
        groups,
        teamsPerGroup,
        phases: {
          gold: goldTeams,
          silver: silverTeams,
        },
        description,
      };
    } else {
      description += `Fase Gold (${goldTeams} squadre), Silver (${silverTeams} squadre) e Bronze (${bronzeTeams} squadre).`;
      return {
        groups,
        teamsPerGroup,
        phases: {
          gold: goldTeams,
          silver: silverTeams,
          bronze: bronzeTeams,
        },
        description,
      };
    }
  };

  const tournamentStructure = calculateTournamentStructure(
    formData.maxParticipants ? parseInt(formData.maxParticipants) : 16,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setSubmitError("You must be logged in to create a tournament");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get current user from Supabase auth
      const user = await getCurrentUser();
      if (!user) {
        setSubmitError("Unable to verify user. Please login again.");
        return;
      }

      // 1. Create tournament
      const newTournament = await createTournament(
        {
          name: formData.name,
          date: formData.date,
          location: formData.location,
          status: "In Preparazione",
          category: formData.category,
          structure: tournamentStructure?.description || "",
        },
        user.id,
      );

      // 2. Create groups for this tournament
      const groupPromises: Promise<any>[] = [];
      if (tournamentStructure && tournamentStructure.groups > 0) {
        for (let i = 0; i < tournamentStructure.groups; i++) {
          groupPromises.push(
            createGroup({
              tournament_id: newTournament.id,
              name: `Girone ${String.fromCharCode(65 + i)}`,
            }),
          );
        }
      }
      await Promise.all(groupPromises);

      // Navigate to tournament detail on success
      navigate(`/tournament/${newTournament.id}`);
    } catch (error: any) {
      console.error("Error creating tournament:", error);
      setSubmitError(
        error.message || "Failed to create tournament. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Home
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold">Crea Nuovo Torneo</h1>
        <p className="text-muted-foreground">
          Compila le informazioni per creare un nuovo torneo di beach volley. I
          partecipanti potranno iscriversi da una pagina pubblica
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        {/* Colonna sinistra - Informazioni del torneo */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informazioni Torneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm">
                  Nome del Torneo *
                </Label>
                <Input
                  id="name"
                  placeholder="es. Torneo Estivo 2026"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="date" className="text-sm">
                  Data del Torneo *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="location" className="text-sm">
                Luogo *
              </Label>
              <Input
                id="location"
                placeholder="es. Bagni Marco, Rimini"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-sm">
                Descrizione
              </Label>
              <Textarea
                id="description"
                placeholder="Descrivi il torneo, le regole particolari, i premi..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="maxParticipants"
                  className="text-sm flex items-center gap-2">
                  Max Partecipanti *
                  <Info className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="16"
                  min="4"
                  max="32"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    handleInputChange("maxParticipants", e.target.value)
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Min. 4 squadre per tornei
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="registrationDeadline" className="text-sm">
                  Scadenza Iscrizioni
                </Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) =>
                    handleInputChange("registrationDeadline", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="entryFee" className="text-sm">
                  Quota (€)
                </Label>
                <Input
                  id="entryFee"
                  type="number"
                  placeholder="20"
                  value={formData.entryFee}
                  onChange={(e) =>
                    handleInputChange("entryFee", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="category" className="text-sm">
                  Categoria
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                  <option value="2x2 Maschile">2x2 Maschile</option>
                  <option value="2x2 Femminile">2x2 Femminile</option>
                  <option value="2x2 Misto">2x2 Misto</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Struttura Torneo</Label>
                <div className="px-3 py-2 border border-input bg-muted/30 rounded-md text-sm min-h-[40px] flex items-center">
                  {tournamentStructure ? (
                    <span className="text-green-700 font-medium">
                      {tournamentStructure.groups} gironi →
                      {tournamentStructure.phases.bronze
                        ? " Gold/Silver/Bronze"
                        : " Gold/Silver"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Inserisci min. 4 squadre
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Anteprima Struttura Torneo */}
            {tournamentStructure && (
              <div className="space-y-1">
                <Label className="text-sm">Anteprima Formato</Label>
                <div className="p-3 border border-input bg-blue-50/50 rounded-md">
                  <p className="text-sm text-blue-800">
                    {tournamentStructure.description}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div className="bg-yellow-100 p-2 rounded text-center">
                      <div className="font-semibold text-yellow-800">
                        🥇 GOLD
                      </div>
                      <div className="text-yellow-700">
                        {tournamentStructure.phases.gold} squadre
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <div className="font-semibold text-gray-800">
                        🥈 SILVER
                      </div>
                      <div className="text-gray-700">
                        {tournamentStructure.phases.silver} squadre
                      </div>
                    </div>
                    {tournamentStructure.phases.bronze && (
                      <div className="bg-orange-100 p-2 rounded text-center">
                        <div className="font-semibold text-orange-800">
                          🥉 BRONZE
                        </div>
                        <div className="text-orange-700">
                          {tournamentStructure.phases.bronze} squadre
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottoni di azione */}
        <div className="flex gap-4 pt-2">
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 inline-block animate-spin">
                  ⚙️
                </span>
                Creazione in corso...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Crea Torneo
              </>
            )}
          </Button>
          <Link to="/" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              disabled={isSubmitting}>
              Annulla
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
