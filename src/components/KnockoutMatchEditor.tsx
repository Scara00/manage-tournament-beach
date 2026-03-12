import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Trophy } from "lucide-react";

interface KnockoutMatch {
  id: number;
  tournament_id: number;
  bracket_id: number;
  round: "SEMIFINAL" | "FINAL" | "THIRD_PLACE";
  team1_id: number;
  team2_id: number;
  team1_name: string;
  team2_name: string;
  team1_score?: number;
  team2_score?: number;
  winner_id?: number;
  status: "scheduled" | "in-progress" | "completed";
  bracket_type: "GOLD" | "SILVER";
}

export function KnockoutMatchEditor({
  tournamentId,
}: {
  tournamentId: number;
}) {
  const [goldMatches, setGoldMatches] = useState<KnockoutMatch[]>([]);
  const [silverMatches, setSilverMatches] = useState<KnockoutMatch[]>([]);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [scores, setScores] = useState<{ team1: number; team2: number }>({
    team1: 0,
    team2: 0,
  });
  const [saving, setSaving] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [tournamentId]);

  const loadMatches = async () => {
    const { data: bracketsData } = await supabase
      .from("tournament_brackets")
      .select("*")
      .eq("tournament_id", tournamentId);

    if (!bracketsData) return;

    for (const bracket of bracketsData) {
      const { data: matchesData } = await supabase
        .from("knockout_matches")
        .select("*")
        .eq("bracket_id", bracket.id)
        .order("round", { ascending: true });

      if (matchesData) {
        const matches = matchesData.map((m) => ({
          ...m,
          bracket_type: bracket.bracket_type,
        }));

        if (bracket.bracket_type === "GOLD") {
          setGoldMatches(matches);
        } else {
          setSilverMatches(matches);
        }
      }
    }

    checkIfAllCompleted();
  };

  const checkIfAllCompleted = () => {
    const allMatches = [...goldMatches, ...silverMatches];
    const allDone =
      allMatches.length > 0 &&
      allMatches.every((m) => m.status === "completed");
    setAllCompleted(allDone);
  };

  const startEditMatch = (matchId: number, match: KnockoutMatch) => {
    setEditingMatch(matchId);
    setScores({ team1: match.team1_score || 0, team2: match.team2_score || 0 });
  };

  const saveMatchResult = async (match: KnockoutMatch) => {
    if (scores.team1 === 0 && scores.team2 === 0) {
      alert("Inserisci i punteggi");
      return;
    }

    setSaving(true);

    // Determina il vincitore
    const winnerId =
      scores.team1 > scores.team2 ? match.team1_id : match.team2_id;

    // Aggiorna il match
    const { error: updateError } = await supabase
      .from("knockout_matches")
      .update({
        team1_score: scores.team1,
        team2_score: scores.team2,
        winner_id: winnerId,
        status: "completed",
      })
      .eq("id", match.id);

    if (updateError) {
      alert("Errore nel salvataggio");
      setSaving(false);
      return;
    }

    // Se è una semifinale, crea il match successivo (finale)
    if (match.round === "SEMIFINAL") {
      await createNextRoundMatch(match.bracket_id, match);
    }

    // Se è una finale, crea la disputa terzo posto se non esiste
    if (match.round === "FINAL") {
      await finalizeBracket(match.tournament_id, match.bracket_type);
    }

    setEditingMatch(null);
    setSaving(false);
    loadMatches();
  };

  const createNextRoundMatch = async (
    bracketId: number,
    currentMatch: KnockoutMatch,
  ) => {
    // Leggi tutti i match di semifinale
    const { data: semifinals } = await supabase
      .from("knockout_matches")
      .select("*")
      .eq("bracket_id", bracketId)
      .eq("round", "SEMIFINAL");

    if (!semifinals || semifinals.length < 2) return;

    const allSemifinalsComplete = semifinals.every(
      (m) => m.status === "completed",
    );

    if (allSemifinalsComplete) {
      const winner1 = semifinals[0].winner_id;
      const winner2 = semifinals[1].winner_id;

      // Leggi i dati delle squadre vincitrici
      const { data: team1Data } = await supabase
        .from("registered_teams")
        .select("*")
        .eq("id", winner1);

      const { data: team2Data } = await supabase
        .from("registered_teams")
        .select("*")
        .eq("id", winner2);

      if (team1Data && team2Data) {
        // Crea la finale
        await supabase.from("knockout_matches").insert({
          bracket_id: bracketId,
          tournament_id: currentMatch.tournament_id,
          round: "FINAL",
          team1_id: winner1,
          team2_id: winner2,
          team1_name: team1Data[0].team_name,
          team2_name: team2Data[0].team_name,
          status: "scheduled",
        });

        // Crea la disputa terzo posto
        const loser1 =
          semifinals[0].winner_id === semifinals[0].team1_id
            ? semifinals[0].team2_id
            : semifinals[0].team1_id;
        const loser2 =
          semifinals[1].winner_id === semifinals[1].team1_id
            ? semifinals[1].team2_id
            : semifinals[1].team1_id;

        const { data: loser1Data } = await supabase
          .from("registered_teams")
          .select("*")
          .eq("id", loser1);

        const { data: loser2Data } = await supabase
          .from("registered_teams")
          .select("*")
          .eq("id", loser2);

        if (loser1Data && loser2Data) {
          await supabase.from("knockout_matches").insert({
            bracket_id: bracketId,
            tournament_id: currentMatch.tournament_id,
            round: "THIRD_PLACE",
            team1_id: loser1,
            team2_id: loser2,
            team1_name: loser1Data[0].team_name,
            team2_name: loser2Data[0].team_name,
            status: "scheduled",
          });
        }
      }
    }
  };

  const finalizeBracket = async (
    tournamentId: number,
    bracketType: "GOLD" | "SILVER",
  ) => {
    // Leggi tutti i match completati di questo bracket
    const { data: brackets } = await supabase
      .from("tournament_brackets")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("bracket_type", bracketType);

    if (!brackets) return;

    const bracketId = brackets[0].id;

    const { data: allMatches } = await supabase
      .from("knockout_matches")
      .select("*")
      .eq("bracket_id", bracketId);

    if (!allMatches) return;

    // Trova i vincitori
    const finalMatch = allMatches.find((m) => m.round === "FINAL");
    const thirdPlaceMatch = allMatches.find((m) => m.round === "THIRD_PLACE");

    if (finalMatch && finalMatch.status === "completed") {
      // Vincitore (1° posto)
      const { data: winnerTeam } = await supabase
        .from("registered_teams")
        .select("*")
        .eq("id", finalMatch.winner_id);

      if (winnerTeam) {
        const team = winnerTeam[0];
        await supabase.from("tournament_podium").upsert({
          tournament_id: tournamentId,
          bracket_type: bracketType,
          position: 1,
          team_id: team.id,
          team_name: team.team_name,
          player1_name: team.player1_name,
          player2_name: team.player2_name,
        });
      }

      // Secondo classificato
      const secondPlaceId =
        finalMatch.winner_id === finalMatch.team1_id
          ? finalMatch.team2_id
          : finalMatch.team1_id;
      const { data: secondTeam } = await supabase
        .from("registered_teams")
        .select("*")
        .eq("id", secondPlaceId);

      if (secondTeam) {
        const team = secondTeam[0];
        await supabase.from("tournament_podium").upsert({
          tournament_id: tournamentId,
          bracket_type: bracketType,
          position: 2,
          team_id: team.id,
          team_name: team.team_name,
          player1_name: team.player1_name,
          player2_name: team.player2_name,
        });
      }
    }

    // Terzo posto
    if (thirdPlaceMatch && thirdPlaceMatch.status === "completed") {
      const { data: bronzeTeam } = await supabase
        .from("registered_teams")
        .select("*")
        .eq("id", thirdPlaceMatch.winner_id);

      if (bronzeTeam) {
        const team = bronzeTeam[0];
        await supabase.from("tournament_podium").upsert({
          tournament_id: tournamentId,
          bracket_type: bracketType,
          position: 3,
          team_id: team.id,
          team_name: team.team_name,
          player1_name: team.player1_name,
          player2_name: team.player2_name,
        });
      }
    }
  };

  const bracketEntries = [
    { title: "GOLD", matches: goldMatches, color: "amber" },
    { title: "SILVER", matches: silverMatches, color: "gray" },
  ];

  return (
    <div className="space-y-8">
      {allCompleted && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">
              Tutti i match completati! 🎉
            </p>
            <p className="text-sm text-green-800">
              I podi finali sono stati generati.
            </p>
          </div>
        </div>
      )}

      {bracketEntries.map(({ title, matches, color }) => (
        <div key={title} className="space-y-3">
          <h3
            className={`flex items-center gap-2 text-xl font-bold text-${color}-600`}>
            <Trophy className="h-5 w-5" />
            {title} Bracket
          </h3>

          <div className="space-y-3">
            {matches.length === 0 ? (
              <p className="text-gray-500">
                Nessun match per il bracket {title}
              </p>
            ) : (
              matches.map((match) => (
                <MatchInputCard
                  key={match.id}
                  match={match}
                  isEditing={editingMatch === match.id}
                  scores={scores}
                  onEdit={() => startEditMatch(match.id, match)}
                  onScoresChange={setScores}
                  onSave={() => saveMatchResult(match)}
                  onCancel={() => setEditingMatch(null)}
                  saving={saving}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchInputCard({
  match,
  isEditing,
  scores,
  onEdit,
  onScoresChange,
  onSave,
  onCancel,
  saving,
}: {
  match: KnockoutMatch;
  isEditing: boolean;
  scores: { team1: number; team2: number };
  onEdit: () => void;
  onScoresChange: (scores: { team1: number; team2: number }) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const roundLabels: Record<string, string> = {
    SEMIFINAL: "Semifinale",
    FINAL: "Finale",
    THIRD_PLACE: "Disputa Terzo Posto",
  };

  const isCompleted = match.status === "completed";

  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-gray-700">
          {roundLabels[match.round]}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            isCompleted
              ? "bg-green-100 text-green-800"
              : match.status === "in-progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
          }`}>
          {isCompleted
            ? "Completato"
            : match.status === "in-progress"
              ? "In Corso"
              : "Programmato"}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {/* Team 1 Input */}
          <div className="flex items-center gap-3">
            <span className="flex-1 font-semibold text-gray-800">
              {match.team1_name}
            </span>
            <input
              type="number"
              min="0"
              max="25"
              value={scores.team1}
              onChange={(e) =>
                onScoresChange({
                  ...scores,
                  team1: parseInt(e.target.value) || 0,
                })
              }
              className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-lg font-bold"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300" />

          {/* Team 2 Input */}
          <div className="flex items-center gap-3">
            <span className="flex-1 font-semibold text-gray-800">
              {match.team2_name}
            </span>
            <input
              type="number"
              min="0"
              max="25"
              value={scores.team2}
              onChange={(e) =>
                onScoresChange({
                  ...scores,
                  team2: parseInt(e.target.value) || 0,
                })
              }
              className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-lg font-bold"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 rounded bg-green-600 px-3 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? "Salvataggio..." : "Salva"}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 rounded bg-gray-300 px-3 py-2 font-semibold text-gray-800 hover:bg-gray-400">
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <div>
          {isCompleted ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded bg-gray-50 p-2">
                <span className="font-semibold text-gray-800">
                  {match.team1_name}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {match.team1_score}
                </span>
              </div>
              <div className="border-t border-gray-300" />
              <div className="flex items-center justify-between rounded bg-gray-50 p-2">
                <span className="font-semibold text-gray-800">
                  {match.team2_name}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {match.team2_score}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-gray-600">
              <p>{match.team1_name || "TBD"}</p>
              <p className="text-center text-gray-400">VS</p>
              <p>{match.team2_name || "TBD"}</p>
            </div>
          )}

          {!isCompleted && (
            <button
              onClick={onEdit}
              className="mt-3 w-full rounded bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700">
              Inserisci Risultato
            </button>
          )}
        </div>
      )}
    </div>
  );
}
