import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Play, Save, X } from "lucide-react";
import { getStatusBadge } from "@/lib/badge-utils";

interface Match {
  id: number;
  groupId: number;
  team1Id: number;
  team2Id: number;
  team1Name: string;
  team2Name: string;
  team1Score?: number;
  team2Score?: number;
  status: "scheduled" | "in-progress" | "completed";
  winner?: number;
}

interface MatchesPanelProps {
  matches: Match[];
  collapsedGroupMatches: Record<number, boolean>;
  editingMatch: number | null;
  tempScores: { team1: string; team2: string };
  onToggleGroup: (groupId: number) => void;
  onStartEdit: (match: Match) => void;
  onSaveScore: (matchId: number) => void;
  onCancelEdit: () => void;
  onScoreChange: (field: "team1" | "team2", value: string) => void;
}

export function MatchesPanel({
  matches,
  collapsedGroupMatches,
  editingMatch,
  tempScores,
  onToggleGroup,
  onStartEdit,
  onSaveScore,
  onCancelEdit,
  onScoreChange,
}: MatchesPanelProps) {
  const groupedMatches = matches.reduce(
    (acc, match) => {
      if (!acc[match.groupId]) acc[match.groupId] = [];
      acc[match.groupId].push(match);
      return acc;
    },
    {} as Record<number, Match[]>,
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Partite</h2>
      {Object.entries(groupedMatches).map(([groupId, groupMatches]) => (
        <Card key={groupId}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => onToggleGroup(Number(groupId))}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Girone - Partite</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {collapsedGroupMatches[Number(groupId)] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {!collapsedGroupMatches[Number(groupId)] && (
            <CardContent className="space-y-2">
              {groupMatches.map((match) => (
                <div key={match.id} className="border rounded p-3 bg-gray-50">
                  {editingMatch === match.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={tempScores.team1}
                          onChange={(e) =>
                            onScoreChange("team1", e.target.value)
                          }
                          placeholder="Score"
                          className="h-8 text-xs flex-1"
                        />
                        <span className="px-2 py-1">-</span>
                        <Input
                          type="number"
                          value={tempScores.team2}
                          onChange={(e) =>
                            onScoreChange("team2", e.target.value)
                          }
                          placeholder="Score"
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                      <div className="flex gap-1 text-xs">
                        <Button
                          onClick={() => onSaveScore(match.id)}
                          size="sm"
                          className="h-6 flex-1 bg-green-600">
                          <Save className="h-2.5 w-2.5 mr-1" />
                          Salva
                        </Button>
                        <Button
                          onClick={onCancelEdit}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2">
                          <X className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-semibold">{match.team1Name}</div>
                        {match.status === "completed" ? (
                          <div className="font-bold">
                            {match.team1Score} - {match.team2Score}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            --
                          </div>
                        )}
                        <div className="font-semibold">{match.team2Name}</div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>{getStatusBadge(match.status)}</span>
                        {match.status === "scheduled" && (
                          <Button
                            onClick={() => onStartEdit(match)}
                            variant="outline"
                            size="sm"
                            className="h-5 px-2 text-xs">
                            <Play className="h-2.5 w-2.5 mr-1" />
                            Gioca
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
