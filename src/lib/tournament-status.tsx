import { Clock, Play, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export type TournamentStatus =
  | "In Preparazione"
  | "In Corso"
  | "Completato"
  | "Attivo";

export interface StatusConfig {
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    badgeText: string;
  };
  icon: ReactNode;
  label: string;
  description: string;
}

export const tournamentStatusConfig: Record<TournamentStatus, StatusConfig> = {
  "In Preparazione": {
    color: {
      bg: "bg-yellow-50",
      border: "border-l-yellow-500",
      text: "text-yellow-900",
      badge: "bg-yellow-100",
      badgeText: "text-yellow-700",
    },
    icon: <Clock className="h-5 w-5 text-yellow-600" />,
    label: "In Preparazione",
    description: "Registrazioni aperte, il torneo sta per iniziare",
  },
  "In Corso": {
    color: {
      bg: "bg-blue-50",
      border: "border-l-blue-500",
      text: "text-blue-900",
      badge: "bg-blue-100",
      badgeText: "text-blue-700",
    },
    icon: <Play className="h-5 w-5 text-blue-600" />,
    label: "In Corso",
    description: "Il torneo è in corso d'opera",
  },
  Attivo: {
    color: {
      bg: "bg-blue-50",
      border: "border-l-blue-500",
      text: "text-blue-900",
      badge: "bg-blue-100",
      badgeText: "text-blue-700",
    },
    icon: <Play className="h-5 w-5 text-blue-600" />,
    label: "In Corso",
    description: "Il torneo è in corso d'opera",
  },
  Completato: {
    color: {
      bg: "bg-green-50",
      border: "border-l-green-500",
      text: "text-green-900",
      badge: "bg-green-100",
      badgeText: "text-green-700",
    },
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    label: "Completato",
    description: "Il torneo è terminato",
  },
};

export const getStatusConfig = (status: string): StatusConfig => {
  const normalizedStatus = status as TournamentStatus;
  return (
    tournamentStatusConfig[normalizedStatus] ||
    tournamentStatusConfig["In Preparazione"]
  );
};

export const sortTournamentsByStatus = (
  tournaments: any[],
): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {
    "In Preparazione": [],
    "In Corso": [],
    Attivo: [],
    Completato: [],
  };

  tournaments.forEach((tournament) => {
    const status = tournament.status || "In Preparazione";
    if (grouped[status]) {
      grouped[status].push(tournament);
    } else if (status === "Attivo") {
      grouped["In Corso"].push(tournament);
    } else {
      grouped["In Preparazione"].push(tournament);
    }
  });

  return grouped;
};
