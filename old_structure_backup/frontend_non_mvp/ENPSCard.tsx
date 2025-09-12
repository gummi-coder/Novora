import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ENPSCardProps {
  surveyId?: number;
  teamId?: number;
  title?: string;
  className?: string;
}

export const ENPSCard: React.FC<ENPSCardProps> = ({ 
  surveyId, 
  teamId, 
  title = "eNPS Score",
  className = "" 
}) => {
  // Static mock data for now
  const enpsData = {
    score: 23,
    breakdown: {
      promoter_pct: 52.0,
      passive_pct: 28.0,
      detractor_pct: 20.0
    },
    status: "Good",
    response_count: 45,
    question_count: 3
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-yellow-100 text-yellow-800';
      case 'Needs Improvement':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 30) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Badge className={getStatusColor(enpsData.status)}>
            {enpsData.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(enpsData.score)}`}>
              {enpsData.score > 0 ? `+${enpsData.score}` : enpsData.score}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Employee Net Promoter Score
            </p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-600">Promoters</span>
              <span className="text-sm text-gray-600">{enpsData.breakdown.promoter_pct}%</span>
            </div>
            <Progress value={enpsData.breakdown.promoter_pct} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Passives</span>
              <span className="text-sm text-gray-600">{enpsData.breakdown.passive_pct}%</span>
            </div>
            <Progress value={enpsData.breakdown.passive_pct} className="h-2 bg-gray-200" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-red-600">Detractors</span>
              <span className="text-sm text-gray-600">{enpsData.breakdown.detractor_pct}%</span>
            </div>
            <Progress value={enpsData.breakdown.detractor_pct} className="h-2 bg-red-200" />
          </div>

          {/* Response Info */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{enpsData.response_count} responses</span>
              <span>{enpsData.question_count} eNPS questions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ENPSCard;
