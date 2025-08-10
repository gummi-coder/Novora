import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Team = { id: string; name: string };
type Driver = { id: string; name: string };
type Score = {
  teamId: string;
  driverId: string;
  score?: number; // 0-10
  delta?: number; // percentage change vs. last period, e.g., 3.2 means +3.2%
  responses?: number; // total number of responses
};

export interface DriverMetricsMatrixProps {
  teams: Team[];
  drivers: Driver[];
  scores: Score[];
  onCellClick?: (teamId: string, driverId: string) => void;
}

type SortState = {
  driverId: string | null;
  direction: "asc" | "desc";
};

function getCellColor(score?: number) {
  if (score == null) return "bg-gray-50";
  if (score < 5) return "bg-red-100";
  if (score <= 7) return "bg-amber-100";
  return "bg-green-100";
}

function ArrowDelta({ delta }: { delta?: number }) {
  if (delta == null || isNaN(delta)) return null;
  const isUp = delta >= 0;
  return (
    <span className={cn("ml-1 text-xs font-medium", isUp ? "text-green-700" : "text-red-700")}>
      {isUp ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

export const DriverMetricsMatrix: React.FC<DriverMetricsMatrixProps> = ({
  teams,
  drivers,
  scores,
  onCellClick,
}) => {
  const [sort, setSort] = useState<SortState>({ driverId: null, direction: "desc" });

  const scoreIndex = useMemo(() => {
    const map = new Map<string, Score>();
    for (const s of scores) {
      map.set(`${s.teamId}::${s.driverId}`, s);
    }
    return map;
  }, [scores]);

  const sortedTeams = useMemo(() => {
    if (!sort.driverId) return teams;
    const dId = sort.driverId;
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...teams].sort((a, b) => {
      const aScore = scoreIndex.get(`${a.id}::${dId}`)?.score ?? -Infinity;
      const bScore = scoreIndex.get(`${b.id}::${dId}`)?.score ?? -Infinity;
      if (aScore === bScore) return 0;
      return (aScore - bScore) * direction;
    });
  }, [teams, scoreIndex, sort]);

  const handleHeaderClick = (driverId: string) => {
    setSort((prev) => {
      if (prev.driverId !== driverId) return { driverId, direction: "desc" };
      return { driverId, direction: prev.direction === "desc" ? "asc" : "desc" };
    });
  };

  const renderCell = (teamId: string, driverId: string) => {
    const s = scoreIndex.get(`${teamId}::${driverId}`);
    const notEnough = (s?.responses ?? 0) < 5;
    const color = getCellColor(s?.score);
    const content = notEnough ? "–" : (s?.score != null ? s.score.toFixed(1) : "–");
    const tooltipText = notEnough
      ? "Not enough responses"
      : `Score: ${s?.score?.toFixed(1) ?? "–"}, Change: ${s?.delta != null ? s.delta.toFixed(1) : "–"}%, Responses: ${s?.responses ?? 0}`;

    return (
      <Tooltip key={`${teamId}-${driverId}`}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "w-full min-w-[7rem] px-3 py-2 text-sm text-gray-900 rounded transition-colors",
              color,
              "hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            onClick={() => onCellClick?.(teamId, driverId)}
          >
            <span className="inline-flex items-center">
              <span className="font-medium">{content}</span>
              {!notEnough && <ArrowDelta delta={s?.delta} />}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      {/* Desktop / Tablet grid */}
      <div className="hidden md:block">
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-56 bg-white sticky left-0 z-20 border-r">
                  Team
                </th>
                {drivers.map((d) => (
                  <th key={d.id} className="text-left align-bottom">
                    <button
                      className={cn(
                        "w-full min-w-[7rem] px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider",
                        "hover:bg-gray-50 border-l"
                      )}
                      onClick={() => handleHeaderClick(d.id)}
                      title="Sort by this driver"
                    >
                      <div className="flex items-center gap-2">
                        <span>{d.name}</span>
                        {sort.driverId === d.id && (
                          <span className="text-gray-400">{sort.direction === "desc" ? "▼" : "▲"}</span>
                        )}
                      </div>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((t) => (
                <tr key={t.id} className="even:bg-white odd:bg-gray-50 border-t">
                  <td className="px-4 py-2 font-medium text-gray-900 bg-white sticky left-0 z-10 border-r">
                    {t.name}
                  </td>
                  {drivers.map((d) => (
                    <td key={`${t.id}-${d.id}`} className="p-0 border-l">
                      {renderCell(t.id, d.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: tabs per driver */}
      <div className="block md:hidden">
        <Tabs defaultValue={drivers[0]?.id} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="min-w-max">
              {drivers.map((d) => (
                <TabsTrigger key={d.id} value={d.id} className="whitespace-nowrap">
                  {d.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {drivers.map((d) => (
            <TabsContent key={d.id} value={d.id} className="mt-4">
              <div className="space-y-2">
                {teams.map((t) => {
                  const s = scoreIndex.get(`${t.id}::${d.id}`);
                  const notEnough = (s?.responses ?? 0) < 5;
                  const color = getCellColor(s?.score);
                  return (
                    <div key={`${t.id}-${d.id}`} className="flex items-center justify-between p-3 rounded border bg-white">
                      <div className="text-sm font-medium text-gray-800">{t.name}</div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              "px-3 py-1.5 rounded text-sm font-medium",
                              color,
                              "hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            )}
                            onClick={() => onCellClick?.(t.id, d.id)}
                          >
                            <span className="inline-flex items-center">
                              <span>{notEnough ? "–" : s?.score?.toFixed(1) ?? "–"}</span>
                              {!notEnough && <ArrowDelta delta={s?.delta} />}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {notEnough
                              ? "Not enough responses"
                              : `Score: ${s?.score?.toFixed(1) ?? "–"}, Change: ${s?.delta != null ? s.delta.toFixed(1) : "–"}%, Responses: ${s?.responses ?? 0}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default DriverMetricsMatrix;


