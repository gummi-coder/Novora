
import React from "react";
import { InsightCard } from "./InsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Insight {
  id: string;
  type: "positive" | "negative" | "warning" | "info";
  title: string;
  description: string;
  actionLabel?: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  onInsightAction?: (insightId: string) => void;
}

export function InsightsPanel({ insights, onInsightAction }: InsightsPanelProps) {
  const handleAction = (insightId: string) => {
    if (onInsightAction) {
      onInsightAction(insightId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Insights & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No insights available at the moment. Check back later as more data is collected.
            </p>
          ) : (
            insights.map(insight => (
              <InsightCard
                key={insight.id}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                actionLabel={insight.actionLabel || "View Details"}
                onAction={() => handleAction(insight.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
