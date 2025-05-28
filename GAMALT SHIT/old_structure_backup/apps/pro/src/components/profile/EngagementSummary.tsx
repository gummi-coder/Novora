
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, CheckCircle, Star } from "lucide-react";

interface EngagementSummaryProps {
  enpsScores: number[];
  surveyCompletionRate: number;
  averageScore: number;
}

export function EngagementSummary({
  enpsScores,
  surveyCompletionRate,
  averageScore,
}: EngagementSummaryProps) {
  // Calculate the latest eNPS score (the last one in the array)
  const latestEnps = enpsScores[enpsScores.length - 1] || 0;
  
  // Calculate the trend (positive, negative, or neutral)
  let trend = "neutral";
  if (enpsScores.length >= 2) {
    const prevScore = enpsScores[enpsScores.length - 2] || 0;
    trend = latestEnps > prevScore ? "positive" : latestEnps < prevScore ? "negative" : "neutral";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* eNPS Rating */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Latest eNPS Rating</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{latestEnps}/10</span>
              {trend === "positive" && (
                <span className="text-xs text-green-500">↑ Improving</span>
              )}
              {trend === "negative" && (
                <span className="text-xs text-red-500">↓ Declining</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Survey Completion */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Survey Completion</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{surveyCompletionRate}%</span>
              <span className="text-xs text-green-500">Active Participant</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{averageScore.toFixed(1)}/10</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
