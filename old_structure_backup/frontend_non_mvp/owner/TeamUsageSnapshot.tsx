import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Star,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  UserPlus,
  Award
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TeamUsageData } from "./types";

const TeamUsageSnapshot = () => {
  const { toast } = useToast();
  const [data, setData] = useState<TeamUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamUsageData = async () => {
      try {
        setLoading(true);
        const response = await api.getTeamUsageSnapshot();
        setData(response);
      } catch (error) {
        console.error('Error fetching team usage data:', error);
        toast({
          title: "Error",
          description: "Failed to load team usage data",
          variant: "destructive"
        });
        // Fallback to mock data
        setData({
          activeTeams: { count: 24, changePercent: 12.5, totalTeams: 30 },
          surveyCompletionRate: { average: 78.5, trend: 'up', changePercent: 5.2 },
          newSignups: { thisWeek: 8, thisMonth: 32, trend: 'up' },
          teamActivity: [
            { id: "1", name: "Engineering", lastActivity: "2024-01-15T10:30:00Z", daysSinceActivity: 2, status: 'active', engagementScore: 92 },
            { id: "2", name: "Sales", lastActivity: "2024-01-14T15:45:00Z", daysSinceActivity: 3, status: 'active', engagementScore: 88 },
            { id: "3", name: "Marketing", lastActivity: "2024-01-12T09:20:00Z", daysSinceActivity: 5, status: 'decaying', engagementScore: 65 },
            { id: "4", name: "HR", lastActivity: "2024-01-10T14:15:00Z", daysSinceActivity: 7, status: 'decaying', engagementScore: 58 },
            { id: "5", name: "Finance", lastActivity: "2024-01-08T11:30:00Z", daysSinceActivity: 9, status: 'inactive', engagementScore: 42 }
          ],
          topEngagedTeams: [
            { id: "1", name: "Engineering", engagementScore: 92, surveyCompletionRate: 95, responseCount: 45, avgResponseTime: 2.3, potential: 'both' },
            { id: "2", name: "Sales", engagementScore: 88, surveyCompletionRate: 87, responseCount: 38, avgResponseTime: 1.8, potential: 'case_study' },
            { id: "3", name: "Product", engagementScore: 85, surveyCompletionRate: 82, responseCount: 32, avgResponseTime: 2.1, potential: 'referral' },
            { id: "4", name: "Customer Success", engagementScore: 82, surveyCompletionRate: 89, responseCount: 28, avgResponseTime: 1.5, potential: 'case_study' },
            { id: "5", name: "Design", engagementScore: 79, surveyCompletionRate: 76, responseCount: 25, avgResponseTime: 2.8, potential: 'referral' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamUsageData();
  }, [toast]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: 'active' | 'decaying' | 'inactive') => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'decaying': return 'text-yellow-600 bg-yellow-50';
      case 'inactive': return 'text-red-600 bg-red-50';
    }
  };

  const getStatusIcon = (status: 'active' | 'decaying' | 'inactive') => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'decaying': return <AlertTriangle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
    }
  };

  const getPotentialBadge = (potential: 'case_study' | 'referral' | 'both') => {
    switch (potential) {
      case 'case_study': return <Badge className="bg-blue-100 text-blue-800">Case Study</Badge>;
      case 'referral': return <Badge className="bg-purple-100 text-purple-800">Referral</Badge>;
      case 'both': return <Badge className="bg-green-100 text-green-800">Both</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Usage Snapshot</CardTitle>
          <CardDescription>Overview of team engagement and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Usage Snapshot</h2>
          <p className="text-gray-600">Comprehensive overview of team engagement and activity</p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Last Updated: {new Date().toLocaleDateString()}
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Teams */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Active Teams This Month</span>
              {getTrendIcon(data.activeTeams.changePercent > 0 ? 'up' : 'down')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{data.activeTeams.count}</span>
              <span className="text-sm text-gray-500">/ {data.activeTeams.totalTeams}</span>
            </div>
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-sm font-medium",
                data.activeTeams.changePercent > 0 ? "text-green-600" : "text-red-600"
              )}>
                {data.activeTeams.changePercent > 0 ? '+' : ''}{data.activeTeams.changePercent}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
            <Progress value={(data.activeTeams.count / data.activeTeams.totalTeams) * 100} className="mt-3" />
          </CardContent>
        </Card>

        {/* Survey Completion Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>Survey Completion Rate</span>
              {getTrendIcon(data.surveyCompletionRate.trend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">{data.surveyCompletionRate.average}%</span>
              <span className="text-sm text-gray-500">average</span>
            </div>
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-sm font-medium",
                data.surveyCompletionRate.changePercent > 0 ? "text-green-600" : "text-red-600"
              )}>
                {data.surveyCompletionRate.changePercent > 0 ? '+' : ''}{data.surveyCompletionRate.changePercent}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
            <Progress value={data.surveyCompletionRate.average} className="mt-3" />
          </CardContent>
        </Card>

        {/* New Signups */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span>New Signups</span>
              {getTrendIcon(data.newSignups.trend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{data.newSignups.thisWeek}</span>
                  <span className="text-sm text-gray-500">this week</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{data.newSignups.thisMonth}</span>
                  <span className="text-sm text-gray-500">this month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Activity & Top Engaged Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Time Since Last Activity
            </CardTitle>
            <CardDescription>Detect team engagement decay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.teamActivity.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn("p-2 rounded-full", getStatusColor(team.status))}>
                      {getStatusIcon(team.status)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{team.name}</p>
                      <p className="text-xs text-gray-500">
                        {team.daysSinceActivity} days ago
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{team.engagementScore}%</p>
                    <p className="text-xs text-gray-500">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Engaged Teams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top 5 Most Engaged Teams
            </CardTitle>
            <CardDescription>Potential case studies & referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topEngagedTeams.map((team, index) => (
                <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">{team.name}</p>
                        {getPotentialBadge(team.potential)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {team.responseCount} responses • {team.avgResponseTime} days avg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{team.engagementScore}%</p>
                    <p className="text-xs text-gray-500">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamUsageSnapshot; 