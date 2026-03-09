import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Group } from "@/types";

interface GroupsPanelProps {
  groups: Group[];
  collapsedGroups: Record<number, boolean>;
  onToggleGroup: (groupId: number) => void;
}

export function GroupsPanel({
  groups,
  collapsedGroups,
  onToggleGroup,
}: GroupsPanelProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h2 className="text-base sm:text-lg font-semibold">Gironi</h2>
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => onToggleGroup(group.id)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base line-clamp-1">
                {group.name}
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {collapsedGroups[group.id] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {!collapsedGroups[group.id] && (
            <CardContent>
              <div className="space-y-1 sm:space-y-2">
                {group.teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-2 border rounded bg-gray-50 text-xs sm:text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold mr-1 sm:mr-3 flex-shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="truncate">{team.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0 ml-2 flex gap-1 sm:gap-2">
                      <Badge variant="outline" className="mr-2">
                        {team.points}pt
                      </Badge>
                      {team.wins}V-{team.losses}S | {team.setsWon}:
                      {team.setsLost}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
