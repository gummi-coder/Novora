import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { api } from "@/lib/api";

interface TeamData {
  id: string;
  name: string;
  avgScore: number;
  scoreChange: number;
  responseCount: number;
  comments: string[];
  sentiment: string;
  alerts: string[];
  isExpanded?: boolean;
}

const TeamBreakdown = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const teamData = await api.getTeamBreakdown();
        setTeams(teamData);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const toggleExpanded = (teamId: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, isExpanded: !team.isExpanded }
        : team
    ));
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return "text-green-600";
    if (score >= 6.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return "text-green-600 bg-green-50";
      case 'negative': return "text-red-600 bg-red-50";
      default: return "text-yellow-600 bg-yellow-50";
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return "Positive";
      case 'negative': return "Negative";
      default: return "Neutral";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Breakdown</CardTitle>
          <CardDescription>Team-specific analytics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Breakdown</CardTitle>
          <CardDescription>Team-specific analytics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Team Breakdown
        </CardTitle>
        <CardDescription>
          Team-specific analytics and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="border rounded-lg overflow-hidden">
              {/* Team Header */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Avg Score:</span>
                          <span className={`font-semibold ${getScoreColor(team.avgScore)}`}>
                            {team.avgScore}/10
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Change:</span>
                          <div className={`flex items-center font-semibold ${getChangeColor(team.scoreChange)}`}>
                            {team.scoreChange > 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : team.scoreChange < 0 ? (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            ) : null}
                            {team.scoreChange > 0 ? '+' : ''}{team.scoreChange.toFixed(1)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Responses:</span>
                          <span className="font-semibold">{team.responseCount}</span>
                        </div>
                        <Badge className={getSentimentColor(team.sentiment)}>
                          {getSentimentLabel(team.sentiment)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {team.alerts.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {team.alerts.length} Alert{team.alerts.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(team.id)}
                      className="h-8 w-8 p-0"
                    >
                      {team.isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {team.isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Alerts */}
                  {team.alerts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Alerts
                      </h4>
                      <div className="space-y-2">
                        {team.alerts.map((alert, index) => (
                          <Alert key={index} className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              {alert}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anonymous Comments */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Anonymous Comments
                    </h4>
                    <div className="space-y-2">
                      {team.comments.map((comment, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm text-gray-700">"{comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Sentiment Analysis */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Sentiment Analysis
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Sentiment:</span>
                        <Badge className={getSentimentColor(team.sentiment)}>
                          {getSentimentLabel(team.sentiment)}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Based on {team.responseCount} responses from {team.name} team members
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamBreakdown;