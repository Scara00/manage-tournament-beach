import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus, Trash2, Users, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Participant {
  id: number;
  teamName: string;
  player1: string;
  player2: string;
}

interface TournamentStructure {
  groups: number;
  teamsPerGroup: number;
  phases: {
    gold: number;
    silver: number;
    bronze?: number;
  };
  description: string;
}

export function CreateTournament() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    maxParticipants: "",
    registrationDeadline: "",
    entryFee: "",
    category: "2x2-misto",
  });

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantMode, setParticipantMode] = useState<
    "team-only" | "full-names"
  >("team-only");

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

    const firstTwoPerGroup = groups * 2; // Primi 2 di ogni girone
    const thirdFourthPerGroup = groups * 2; // 3° e 4° di ogni girone
    const remaining = numTeams - firstTwoPerGroup - thirdFourthPerGroup;

    let description = `${groups} gironi da ${teamsPerGroup} squadre. `;

    if (remaining <= 0) {
      description += `Fase Gold (${firstTwoPerGroup} squadre) e Silver (${thirdFourthPerGroup} squadre).`;
      return {
        groups,
        teamsPerGroup,
        phases: {
          gold: firstTwoPerGroup,
          silver: thirdFourthPerGroup,
        },
        description,
      };
    } else {
      description += `Fase Gold (${firstTwoPerGroup} squadre), Silver (${thirdFourthPerGroup} squadre) e Bronze (${remaining} squadre).`;
      return {
        groups,
        teamsPerGroup,
        phases: {
          gold: firstTwoPerGroup,
          silver: thirdFourthPerGroup,
          bronze: remaining,
        },
        description,
      };
    }
  };

  const tournamentStructure = calculateTournamentStructure(
    formData.maxParticipants
      ? parseInt(formData.maxParticipants)
      : participants.length,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tournamentData = {
      ...formData,
      participants: participants,
      tournamentStructure: tournamentStructure,
    };
    console.log("Tournament data:", tournamentData);
    // Qui andrà la logica per salvare il torneo
    navigate("/");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now(),
      teamName: "",
      player1: "",
      player2: "",
    };
    setParticipants((prev) => [...prev, newParticipant]);
  };

  const removeParticipant = (id: number) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const updateParticipant = (
    id: number,
    field: keyof Participant,
    value: string,
  ) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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
          Compila le informazioni per creare un nuovo torneo di beach volley
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <option value="2x2-maschile">2x2 Maschile</option>
                  <option value="2x2-femminile">2x2 Femminile</option>
                  <option value="2x2-misto">2x2 Misto</option>
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

        {/* Colonna destra - Partecipanti */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Partecipanti</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="participant-mode" className="text-xs">
                  Modalità:
                </Label>
                <select
                  id="participant-mode"
                  value={participantMode}
                  onChange={(e) =>
                    setParticipantMode(
                      e.target.value as "team-only" | "full-names",
                    )
                  }
                  className="px-2 py-1 border border-input bg-background rounded text-xs">
                  <option value="team-only">Solo Nome Squadra</option>
                  <option value="full-names">Squadra + Giocatori</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="border rounded-lg p-3 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-xs">
                      Squadra {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(participant.id)}
                      className="ml-auto p-1 h-6 w-6 text-red-500 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Nome Squadra"
                      value={participant.teamName}
                      onChange={(e) =>
                        updateParticipant(
                          participant.id,
                          "teamName",
                          e.target.value,
                        )
                      }
                      className="text-sm"
                    />

                    {participantMode === "full-names" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Giocatore 1"
                          value={participant.player1}
                          onChange={(e) =>
                            updateParticipant(
                              participant.id,
                              "player1",
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                        <Input
                          placeholder="Giocatore 2"
                          value={participant.player2}
                          onChange={(e) =>
                            updateParticipant(
                              participant.id,
                              "player2",
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={addParticipant}
                className="w-full"
                size="sm">
                <Plus className="mr-2 h-3 w-3" />
                Aggiungi Squadra
              </Button>

              {participants.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {participants.length} squadre aggiunte
                  {formData.maxParticipants &&
                    ` (max: ${formData.maxParticipants})`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottoni di azione - full width sotto entrambe le colonne */}
        <div className="lg:col-span-2 flex gap-4 pt-2">
          <Button type="submit" className="flex-1" size="lg">
            <Save className="mr-2 h-4 w-4" />
            Crea Torneo
          </Button>
          <Link to="/" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg">
              Annulla
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
