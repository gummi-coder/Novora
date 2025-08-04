import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  HelpCircle, 
  Eye, 
  EyeOff,
  TrendingDown,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Plus,
  Minus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SupportRiskData, TeamSupportStatus, NPSData, WatchListTeam } from "./types";

const SupportRiskFlags = () => {
  const { toast } = useToast();
  const [data, setData] = useState<SupportRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showWatchList, setShowWatchList] = useState(false);

  useEffect(() => {
    const fetchSupportRiskData = async () => {
      try {
        setLoading(true);
        const response = await api.getSupportRiskFlags();
        setData(response);
      } catch (error) {
        console.error('Error fetching support risk data:', error);
        toast({
          title: "Error",
          description: "Failed to load support and risk data",
          variant: "destructive"
        });
        // Fallback to mock data
        setData({
          teamsNeedingHelp: [
            {
              id: "1",
              name: "Engineering",
              helpRequested: "2024-01-16T14:30:00Z",
              issueType: "technical_support",
              priority: "medium",
              description: "Having trouble with survey analytics setup",
              contactPerson: "John Smith",
              contactEmail: "john.smith@company.com",
              contactPhone: "+1-555-0123",
              status: "open"
            },
            {
              id: "2",
              name: "Sales",
              helpRequested: "2024-01-15T10:15:00Z",
              issueType: "training",
              priority: "high",
              description: "Need training on advanced survey features",
              contactPerson: "Sarah Johnson",
              contactEmail: "sarah.johnson@company.com",
              contactPhone: "+1-555-0124",
              status: "in_progress"
            }
          ],
          atRiskTeams: [
            {
              id: "3",
              name: "Marketing",
              alertCount: 4,
              riskLevel: "high",
              lastAlert: "2024-01-16T16:45:00Z",
              alerts: [
                "Low survey completion rate (45%)",
                "Negative sentiment trend",
                "Multiple urgent comments flagged",
                "Score drop >2.0 points"
              ],
              engagementScore: 32,
              daysSinceLastActivity: 8
            },
            {
              id: "4",
              name: "HR",
              alertCount: 3,
              riskLevel: "medium",
              lastAlert: "2024-01-15T11:20:00Z",
              alerts: [
                "Survey completion rate below 70%",
                "Score drop >1.5 points",
                "Team engagement declining"
              ],
              engagementScore: 58,
              daysSinceLastActivity: 5
            }
          ],
          npsData: {
            overallScore: 7.2,
            trend: "up",
            changePercent: 0.8,
            recentScores: [
              { team: "Engineering", score: 8.5, trend: "up", responses: 45 },
              { team: "Sales", score: 7.8, trend: "stable", responses: 38 },
              { team: "Marketing", score: 5.2, trend: "down", responses: 25 },
              { team: "HR", score: 6.1, trend: "down", responses: 28 }
            ]
          },
          watchList: [
            {
              id: "1",
              name: "Engineering",
              addedDate: "2024-01-10T09:00:00Z",
              reason: "High growth team - monitor closely",
              notes: "Expanding rapidly, need to ensure survey tools scale",
              priority: "high"
            },
            {
              id: "2",
              name: "Marketing",
              addedDate: "2024-01-12T14:30:00Z",
              reason: "At-risk team - needs attention",
              notes: "Multiple alerts, declining engagement",
              priority: "high"
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSupportRiskData();
  }, [toast]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-blue-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleWatch = async (teamId: string, isWatched: boolean) => {
    try {
      await api.toggleTeamWatch(teamId, isWatched);
      toast({
        title: isWatched ? "Added to Watch List" : "Removed from Watch List",
        description: `Team ${isWatched ? 'added to' : 'removed from'} watch list`,
      });
      // Refresh data
      const response = await api.getSupportRiskFlags();
      setData(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watch list",
        variant: "destructive"
      });
    }
  };

  const handleContactTeam = (team: TeamSupportStatus) => {
    // In a real app, this would open contact options
    toast({
      title: "Contact Team",
      description: `Opening contact options for ${team.name}`,
    });
  };

  const filteredTeamsNeedingHelp = data?.teamsNeedingHelp.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterStatus === "all" || team.status === filterStatus)
  ) || [];

  const filteredAtRiskTeams = data?.atRiskTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support & Risk Flags</CardTitle>
          <CardDescription>Monitor teams needing help and at-risk teams</CardDescription>
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
          <h2 className="text-2xl font-bold text-gray-900">Support & Risk Flags</h2>
          <p className="text-gray-600">Monitor teams needing help and identify at-risk teams</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowWatchList(!showWatchList)}>
            {showWatchList ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showWatchList ? 'Hide' : 'Show'} Watch List
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* NPS Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Recent NPS & Feedback Scores
          </CardTitle>
          <CardDescription>
            Overall NPS: {data.npsData.overallScore}/10 
            {getTrendIcon(data.npsData.trend)}
            {data.npsData.changePercent > 0 ? '+' : ''}{data.npsData.changePercent}% vs last month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.npsData.recentScores.map((score) => (
              <div key={score.team} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{score.team}</h4>
                  {getTrendIcon(score.trend)}
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{score.score}</span>
                  <span className="text-sm text-gray-500">/10</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{score.responses} responses</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teams Needing Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Teams That Clicked "Need Help" ({filteredTeamsNeedingHelp.length})
          </CardTitle>
          <CardDescription>
            Teams that have requested support or assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTeamsNeedingHelp.length > 0 ? (
            <div className="space-y-4">
              {filteredTeamsNeedingHelp.map((team) => (
                <div key={team.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{team.name}</h4>
                      <Badge className={getPriorityColor(team.priority)}>
                        {team.priority}
                      </Badge>
                      <Badge className={getStatusColor(team.status)}>
                        {team.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Requested: {formatDate(team.helpRequested)}</span>
                      <span>Contact: {team.contactPerson}</span>
                      <span>{team.contactEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleContactTeam(team)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No teams currently need help</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* At-Risk Teams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            At-Risk Teams ({filteredAtRiskTeams.length})
          </CardTitle>
          <CardDescription>
                         Teams with &gt;2 alerts or declining engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAtRiskTeams.length > 0 ? (
            <div className="space-y-4">
              {filteredAtRiskTeams.map((team) => (
                <div key={team.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{team.name}</h4>
                      <Badge className={getRiskLevelColor(team.riskLevel)}>
                        {team.riskLevel} risk
                      </Badge>
                      <Badge variant="outline">
                        {team.alertCount} alerts
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={data.watchList.some(w => w.id === team.id)}
                        onCheckedChange={(checked) => handleToggleWatch(team.id, checked)}
                      />
                      <span className="text-xs text-gray-500">Watch</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Engagement Score</p>
                      <p className="text-sm font-medium">{team.engagementScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Days Since Activity</p>
                      <p className="text-sm font-medium">{team.daysSinceLastActivity} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Alert</p>
                      <p className="text-sm font-medium">{formatDate(team.lastAlert)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Recent Alerts:</p>
                    <ul className="space-y-1">
                      {team.alerts.map((alert, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 text-red-500 mr-2" />
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No at-risk teams found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watch List */}
      {showWatchList && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Manual Watch List ({data.watchList.length})
            </CardTitle>
            <CardDescription>
              Teams you've marked for close monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.watchList.length > 0 ? (
              <div className="space-y-4">
                {data.watchList.map((team) => (
                  <div key={team.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{team.name}</h4>
                        <Badge className={getPriorityColor(team.priority)}>
                          {team.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{team.reason}</p>
                      {team.notes && (
                        <p className="text-sm text-gray-500 mb-2">Notes: {team.notes}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Added: {formatDate(team.addedDate)}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleWatch(team.id, false)}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No teams in watch list</p>
                <p className="text-xs text-gray-500 mt-1">Use the "Watch" toggle to add teams</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupportRiskFlags; 