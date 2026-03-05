import { Badge } from "@/components/ui/badge";
import { Clock, Play, Check } from "lucide-react";

export const getStatusBadge = (status: "scheduled" | "in-progress" | "completed") => {
  switch (status) {
    case "scheduled":
      return (
        <Badge variant="outline" className="text-xs h-4 px-1">
          <Clock className="w-2 h-2 mr-1" />
          Da Giocare
        </Badge>
      );
    case "in-progress":
      return (
        <Badge variant="default" className="text-xs h-4 px-1">
          <Play className="w-2 h-2 mr-1" />
          In Corso
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="secondary" className="text-xs h-4 px-1">
          <Check className="w-2 h-2 mr-1" />
          Completata
        </Badge>
      );
  }
};
