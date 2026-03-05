import { useState, useEffect } from "react";
import { Loader, AlertCircle } from "lucide-react";
import {
  searchTeamsBySurname,
  getTournamentGroupsWithTeams,
  getTournamentMatches,
  subscribeToTournamentMatches,
} from "@/lib/supabase";
import { AthleteLogin } from "@/components/AthleteLogin";
import { TournamentsList } from "@/components/TournamentsList";
import { AthleteTournamentDetail } from "@/components/AthleteTournamentDetail";
import type { GroupData, MatchData, TournamentDetailsData } from "@/types";

export function AthletePortal() {
  const [surname, setSurname] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [athleteTeams, setAthleteTeams] = useState<any[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);
  const [tournamentDetails, setTournamentDetails] =
    useState<TournamentDetailsData | null>(null);
  const [loadingTournament, setLoadingTournament] = useState(false);

  const handleLogin = async () => {
    if (!surname.trim()) {
      setError("Inserisci il tuo cognome");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const teams = await searchTeamsBySurname(surname);
      if (teams && teams.length > 0) {
        setAthleteTeams(teams);
        setIsLoggedIn(true);
      } else {
        setError("Cognome non trovato. Controlla e riprova.");
      }
    } catch (err) {
      console.error("Errore nella ricerca:", err);
      setError("Errore durante la ricerca. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTournament = async (tournamentId: number) => {
    setLoadingTournament(true);
    setSelectedTournamentId(tournamentId);

    try {
      const groups = await getTournamentGroupsWithTeams(tournamentId);
      const matches = await getTournamentMatches(tournamentId);

      const tournament = athleteTeams.find(
        (t) => t.tournament.id === tournamentId,
      )?.tournament;

      setTournamentDetails({
        id: tournament.id,
        name: tournament.name,
        date: tournament.date,
        location: tournament.location,
        status: tournament.status,
        category: tournament.category,
        structure: tournament.structure,
        groups: groups as GroupData[],
        matches: matches as MatchData[],
      });
    } catch (err) {
      console.error("Errore nel caricamento del torneo:", err);
      setError("Errore nel caricamento dei dettagli del torneo.");
    } finally {
      setLoadingTournament(false);
    }
  };

  // Sottoscrivi ai cambiamenti realtime delle partite
  useEffect(() => {
    if (!selectedTournamentId || !tournamentDetails) return;

    // Sottoscrivi agli aggiornamenti delle partite
    const unsubscribeMatches = subscribeToTournamentMatches(
      selectedTournamentId,
      (updatedMatch: any) => {
        setTournamentDetails((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            matches: prev.matches.map((m) =>
              m.id === updatedMatch.id
                ? {
                    id: updatedMatch.id,
                    group_id: updatedMatch.group_id,
                    team1_id: updatedMatch.team1_id,
                    team2_id: updatedMatch.team2_id,
                    team1_name: updatedMatch.team1_name,
                    team2_name: updatedMatch.team2_name,
                    team1_score: updatedMatch.team1_score,
                    team2_score: updatedMatch.team2_score,
                    status: updatedMatch.status,
                    winner_id: updatedMatch.winner_id,
                  }
                : m,
            ),
          };
        });
      },
    );

    // Cleanup subscription quando il componente unmount
    return () => {
      unsubscribeMatches();
    };
  }, [selectedTournamentId, tournamentDetails]);

  if (!isLoggedIn) {
    return (
      <AthleteLogin
        surname={surname}
        isLoading={isLoading}
        error={error}
        onSurnameChange={(value) => {
          setSurname(value);
          setError(null);
        }}
        onLogin={handleLogin}
        onErrorClear={() => setError(null)}
      />
    );
  }

  if (!selectedTournamentId) {
    return (
      <TournamentsList
        tournaments={Array.from(
          new Map(
            athleteTeams.map((team) => [team.tournament.id, team.tournament]),
          ).values(),
        )}
        userTeams={athleteTeams}
        onSelectTournament={handleSelectTournament}
        onLogout={() => {
          setIsLoggedIn(false);
          setSurname("");
          setAthleteTeams([]);
          setError(null);
        }}
        athleteName={
          athleteTeams[0]?.player1_name || athleteTeams[0]?.player2_name
        }
      />
    );
  }

  if (loadingTournament) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Caricamento torneo...</p>
        </div>
      </div>
    );
  }

  if (!tournamentDetails) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Errore</h2>
          <p className="text-muted-foreground mb-4">
            Impossibile caricare i dettagli del torneo.
          </p>
        </div>
      </div>
    );
  }

  const userTeam = athleteTeams.find(
    (t: any) => t.tournament.id === selectedTournamentId,
  );
  const userGroup = tournamentDetails.groups.find(
    (g: any) => g.id === userTeam?.group_id,
  );
  const userTeamData = userGroup?.registered_teams.find(
    (t: any) => t.team_name === userTeam?.team_name,
  );
  const userMatches = tournamentDetails.matches.filter(
    (m) =>
      (m.team1_name === userTeam?.team_name ||
        m.team2_name === userTeam?.team_name) &&
      m.group_id === userTeam?.group_id,
  );
  const ranking =
    userGroup?.registered_teams
      .slice()
      .sort((a: any, b: any) => b.points - a.points) || [];
  [];

  return (
    <AthleteTournamentDetail
      tournament={tournamentDetails}
      userTeam={userTeam}
      userGroup={userGroup}
      userTeamData={userTeamData}
      userMatches={userMatches}
      ranking={ranking}
      onBackClick={() => {
        setSelectedTournamentId(null);
        setTournamentDetails(null);
      }}
    />
  );
}
