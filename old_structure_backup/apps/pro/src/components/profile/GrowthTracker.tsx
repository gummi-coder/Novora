
import React from "react";
import { CircleCheck, CircleDashed, Calendar } from "lucide-react";

interface GrowthItem {
  id: string;
  title: string;
  status: "Completed" | "In Progress" | "Not Started";
  dueDate: string;
}

interface GrowthTrackerProps {
  growthItems: GrowthItem[];
}

export function GrowthTracker({ growthItems }: GrowthTrackerProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {growthItems.length > 0 ? (
        growthItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 border rounded-md bg-background"
          >
            {item.status === "Completed" ? (
              <CircleCheck className="h-5 w-5 text-green-500" />
            ) : (
              <CircleDashed className="h-5 w-5 text-amber-500" />
            )}
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>Due: {formatDate(item.dueDate)}</span>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                item.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : item.status === "In Progress"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-4">
          No growth tasks assigned
        </p>
      )}
    </div>
  );
}
