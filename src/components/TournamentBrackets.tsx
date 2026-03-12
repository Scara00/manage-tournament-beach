import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Trophy, Zap } from "lucide-react";

interface PodiumData {
  gold: {
    position: number;
    team_name: string;
    player1_name?: string;
    player2_name?: string;
  };
  silver: {
    position: number;
    team_name: string;
    player1_name?: string;
    player2_name?: string;
  };
  bronze: {
    position: number;
    team_name: string;
    player1_name?: string;
    player2_name?: string;
  };
}

export function TournamentBrackets({ tournamentId }: { tournamentId: number }) {
  const [groupsCompleted, setGroupsCompleted] = useState(false);
  const [bracketGenerated, setBracketGenerated] = useState(false);
  const [goldBracket, setGoldBracket] = useState<any>(null);
  const [silverBracket, setSilverBracket] = useState<any>(null);
  const [podium, setPodium] = useState<PodiumData | null>(null);
  const [generating, setGenerating] = useState(false);

  // Verifica se tutti i gironi sono conclusi
  useEffect(() => {
    checkIfGroupsCompleted();
  }, [tournamentId]);

  const checkIfGroupsCompleted = async () => {
    const { data: groups } = await supabase
      .from("groups")
      .select("id")
      .eq("tournament_id", tournamentId);

    if (!groups || groups.length === 0) return;

    // Leggi TUTTE le partite per ogni girone
    let allCompleted = true;

    for (const group of groups) {
      const { data: matches } = await supabase
        .from("matches")
        .select("status")
        .eq("group_id", group.id);

      if (matches && matches.some((m) => m.status !== "completed")) {
        allCompleted = false;
        break;
      }
    }

    setGroupsCompleted(allCompleted);

    // Controlla se i bracket sono già stati generati
    const { data: brackets } = await supabase
      .from("tournament_brackets")
      .select("*")
      .eq("tournament_id", tournamentId);

    if (brackets && brackets.length > 0) {
      setBracketGenerated(true);
      loadBrackets();
    }
  };

  const generateBrackets = async () => {
    setGenerating(true);

    // Ottieni classifiche di tutti i gironi
    const { data: groups } = await supabase
      .from("groups")
      .select("id")
      .eq("tournament_id", tournamentId);

    if (!groups) return;

    const goldTeams: any[] = [];
    const silverTeams: any[] = [];

    // Raccogli dei primi 2 posti (GOLD) e 3-4 (SILVER) da ogni girone
    for (const group of groups) {
      const { data: teams } = await supabase
        .from("registered_teams")
        .select("*")
        .eq("group_id", group.id)
        .order("points", { ascending: false })
        .order("sets_won", { ascending: false });

      if (teams && teams.length >= 2) {
        goldTeams.push(teams[0]);
        goldTeams.push(teams[1]);
      }

      if (teams && teams.length >= 4) {
        silverTeams.push(teams[2]);
        silverTeams.push(teams[3]);
      } else if (teams && teams.length === 3) {
        silverTeams.push(teams[2]);
      }
    }

    // Crea i bracket GOLD
    const goldBracketId = await createBracketAndMatches(
      tournamentId,
      "GOLD",
      goldTeams,
    );

    // Crea i bracket SILVER
    const silverBracketId = await createBracketAndMatches(
      tournamentId,
      "SILVER",
      silverTeams,
    );

    // Carica i bracket appena creati
    if (goldBracketId && silverBracketId) {
      setBracketGenerated(true);
      loadBrackets();
    }

    setGenerating(false);
  };

  const createBracketAndMatches = async (
    tournamentId: number,
    bracketType: "GOLD" | "SILVER",
    teams: any[],
  ) => {
    // Crea il record del bracket
    const { data: bracketData, error: bracketError } = await supabase
      .from("tournament_brackets")
      .insert({
        tournament_id: tournamentId,
        bracket_type: bracketType,
        status: "in-progress",
      })
      .select("id");

    if (bracketError || !bracketData) {
      console.error("Errore creazione bracket:", bracketError);
      return null;
    }

    const bracketId = bracketData[0].id;

    // Crea le semifinali
    if (teams.length >= 2) {
      // Semifinale 1: Teams[0] vs Teams[1]
      await supabase.from("knockout_matches").insert({
        bracket_id: bracketId,
        tournament_id: tournamentId,
        round: "SEMIFINAL",
        team1_id: teams[0].id,
        team2_id: teams[1].id,
        team1_name: teams[0].team_name,
        team2_name: teams[1].team_name,
        status: "scheduled",
      });
    }

    if (teams.length >= 4) {
      // Semifinale 2: Teams[2] vs Teams[3]
      await supabase.from("knockout_matches").insert({
        bracket_id: bracketId,
        tournament_id: tournamentId,
        round: "SEMIFINAL",
        team1_id: teams[2].id,
        team2_id: teams[3].id,
        team1_name: teams[2].team_name,
        team2_name: teams[3].team_name,
        status: "scheduled",
      });
    } else if (teams.length === 3) {
      // Se ci sono solo 3 squadre, la 1a sfida direttamente la finale
      await supabase.from("knockout_matches").insert({
        bracket_id: bracketId,
        tournament_id: tournamentId,
        round: "FINAL",
        team1_id: teams[0].id,
        team1_name: teams[0].team_name,
        status: "scheduled",
      });

      // Team3 aspetta
      await supabase.from("knockout_matches").insert({
        bracket_id: bracketId,
        tournament_id: tournamentId,
        round: "THIRD_PLACE",
        team1_id: teams[2].id,
        team1_name: teams[2].team_name,
        status: "scheduled",
      });
    }

    return bracketId;
  };

  const loadBrackets = async () => {
    const { data: brackets } = await supabase
      .from("tournament_brackets")
      .select("*")
      .eq("tournament_id", tournamentId);

    if (brackets) {
      for (const bracket of brackets) {
        const { data: matches } = await supabase
          .from("knockout_matches")
          .select("*")
          .eq("bracket_id", bracket.id)
          .order("round", { ascending: true });

        if (bracket.bracket_type === "GOLD") {
          setGoldBracket(matches);
        } else {
          setSilverBracket(matches);
        }
      }
    }

    // Carica i podi
    const { data: podiumData } = await supabase
      .from("tournament_podium")
      .select("*")
      .eq("tournament_id", tournamentId);

    if (podiumData && podiumData.length > 0) {
      const gold = podiumData.find(
        (p) => p.bracket_type === "GOLD" && p.position === 1,
      );
      const silver = podiumData.find(
        (p) => p.bracket_type === "GOLD" && p.position === 2,
      );
      const bronze = podiumData.find(
        (p) => p.bracket_type === "GOLD" && p.position === 3,
      );

      if (gold || silver || bronze) {
        setPodium({
          gold: gold || { position: 1, team_name: "TBD" },
          silver: silver || { position: 2, team_name: "TBD" },
          bronze: bronze || { position: 3, team_name: "TBD" },
        });
      }
    }
  };

  return (
    <div className="space-y-8 py-8">
      {!groupsCompleted && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-900">
              Gironi non completati
            </p>
            <p className="text-sm text-yellow-800">
              Completa tutte le partite dei gironi prima di generare i bracket
            </p>
          </div>
        </div>
      )}

      {groupsCompleted && !bracketGenerated && (
        <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <Zap className="h-6 w-6 text-blue-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">
              Pronto a generare i bracket!
            </h3>
            <p className="text-sm text-blue-800">
              I gironi sono conclusi. Genera i tabelloni automaticamente
              procedendo alle fasi finali.
            </p>
          </div>
          <button
            onClick={generateBrackets}
            disabled={generating}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {generating ? "Generazione..." : "Genera Bracket"}
          </button>
        </div>
      )}

      {bracketGenerated && (
        <>
          {/* BRACKET GOLD */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-amber-600">
              <Trophy className="h-6 w-6" />
              Bracket GOLD
            </h2>
            <BracketVisualizer matches={goldBracket} bracketType="GOLD" />
          </div>

          {/* BRACKET SILVER */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-500">
              <Trophy className="h-6 w-6" />
              Bracket SILVER
            </h2>
            <BracketVisualizer matches={silverBracket} bracketType="SILVER" />
          </div>

          {/* PODIO FINALE */}
          {podium && <PodiumDisplay podium={podium} />}
        </>
      )}
    </div>
  );
}

function BracketVisualizer({
  matches,
  bracketType,
}: {
  matches: any[];
  bracketType: "GOLD" | "SILVER";
}) {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-gray-500">
        Nessun match nel bracket {bracketType}
      </div>
    );
  }

  const semifinals = matches.filter((m) => m.round === "SEMIFINAL");
  const finals = matches.filter((m) => m.round === "FINAL");
  const thirdPlace = matches.filter((m) => m.round === "THIRD_PLACE");

  return (
    <div className="space-y-6">
      {/* SEMIFINALI */}
      {semifinals.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-700">Semifinali</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {semifinals.map((match, idx) => (
              <MatchCard key={idx} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* FINALI */}
      {finals.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-700">Finale</h3>
          <div className="max-w-md">
            {finals.map((match, idx) => (
              <MatchCard key={idx} match={match} highlighted />
            ))}
          </div>
        </div>
      )}

      {/* TERZO POSTO */}
      {thirdPlace.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-gray-700">
            Disputa Terzo Posto
          </h3>
          <div className="max-w-md">
            {thirdPlace.map((match, idx) => (
              <MatchCard key={idx} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  highlighted,
}: {
  match: any;
  highlighted?: boolean;
}) {
  const isCompleted = match.status === "completed";
  const bgClass = highlighted
    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300"
    : "bg-gray-50 border-gray-200";

  return (
    <div className={`rounded-lg border p-4 ${bgClass}`}>
      <div className="space-y-2">
        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-2 rounded ${isCompleted && match.winner_id === match.team1_id ? "bg-green-100" : "bg-white"}`}>
          <span className="font-semibold text-gray-800">
            {match.team1_name || "TBD"}
          </span>
          {isCompleted && (
            <span className="text-lg font-bold text-gray-900">
              {match.team1_score}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300" />

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-2 rounded ${isCompleted && match.winner_id === match.team2_id ? "bg-green-100" : "bg-white"}`}>
          <span className="font-semibold text-gray-800">
            {match.team2_name || "TBD"}
          </span>
          {isCompleted && (
            <span className="text-lg font-bold text-gray-900">
              {match.team2_score}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span
          className={`px-2 py-1 rounded font-semibold ${
            match.status === "completed"
              ? "bg-green-100 text-green-800"
              : match.status === "in-progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
          }`}>
          {match.status === "scheduled"
            ? "Non iniziato"
            : match.status === "in-progress"
              ? "In corso"
              : "Completato"}
        </span>
        {match.match_date && (
          <span className="text-gray-600">
            {new Date(match.match_date).toLocaleDateString("it-IT", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

function PodiumDisplay({ podium }: { podium: PodiumData }) {
  return (
    <div className="rounded-lg border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 p-8">
      <h2 className="mb-6 text-center text-3xl font-bold text-amber-900">
        🏆 PODIO FINALE 🏆
      </h2>

      <div className="flex items-end justify-center gap-4 md:gap-8">
        {/* ARGENTO (Secondo) */}
        <div className="w-32 text-center">
          <div className="rounded-t-lg border-2 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 p-4">
            <p className="text-3xl font-bold text-gray-700">2°</p>
            <p className="mt-2 font-semibold text-gray-800">
              {podium.silver.team_name}
            </p>
            {podium.silver.player1_name && (
              <p className="text-xs text-gray-700">
                {podium.silver.player1_name} & {podium.silver.player2_name}
              </p>
            )}
          </div>
          <div className="h-16 border-2 border-gray-400 bg-gray-300" />
        </div>

        {/* ORO (Primo) */}
        <div className="w-32 text-center">
          <div className="rounded-t-lg border-4 border-amber-400 bg-gradient-to-b from-amber-300 to-amber-400 p-4">
            <p className="text-4xl font-bold text-amber-900">🥇</p>
            <p className="mt-2 font-bold text-amber-900">
              {podium.gold.team_name}
            </p>
            {podium.gold.player1_name && (
              <p className="text-xs text-amber-800">
                {podium.gold.player1_name} & {podium.gold.player2_name}
              </p>
            )}
          </div>
          <div className="h-24 border-4 border-amber-400 bg-amber-300" />
        </div>

        {/* BRONZO (Terzo) */}
        <div className="w-32 text-center">
          <div className="rounded-t-lg border-2 border-orange-700 bg-gradient-to-b from-orange-200 to-orange-300 p-4">
            <p className="text-3xl font-bold text-orange-800">3°</p>
            <p className="mt-2 font-semibold text-orange-900">
              {podium.bronze.team_name}
            </p>
            {podium.bronze.player1_name && (
              <p className="text-xs text-orange-800">
                {podium.bronze.player1_name} & {podium.bronze.player2_name}
              </p>
            )}
          </div>
          <div className="h-12 border-2 border-orange-700 bg-orange-300" />
        </div>
      </div>
    </div>
  );
}
