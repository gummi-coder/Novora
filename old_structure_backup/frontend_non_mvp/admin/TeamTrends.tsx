import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Trophy, 
  Users, 
  Download, 
  Share, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Filter,
  BarChart3,
  Target,
  Activity,
  Info,
  FileText,
  FileDown
} from "lucide-react";

// Types
type TimeRange = "last-month" | "last-3-months" | "last-6-months";
type Metric = "all" | "job-satisfaction" | "enps" | "manager-relationship" | "peer-collaboration" | "recognition" | "career-growth" | "value-alignment" | "communication" | "work-environment" | "health-wellness" | "engagement";

interface TeamData {
  id: string;
  name: string;
  avgScore: number;
  trend: number;
  participationRate: number;
  responseRate: number;
  status: 'improving' | 'declining' | 'stable';
}

interface HeatmapData {
  teamId: string;
  teamName: string;
  participationRate: number;
  jobSatisfaction: { score: number; trend: number; responseRate: number };
  enps: { score: number; trend: number; responseRate: number };
  managerRelationship: { score: number; trend: number; responseRate: number };
  peerCollaboration: { score: number; trend: number; responseRate: number };
  recognition: { score: number; trend: number; responseRate: number };
  careerGrowth: { score: number; trend: number; responseRate: number };
  valueAlignment: { score: number; trend: number; responseRate: number };
  communication: { score: number; trend: number; responseRate: number };
  workEnvironment: { score: number; trend: number; responseRate: number };
  healthWellness: { score: number; trend: number; responseRate: number };
  engagement: { score: number; trend: number; responseRate: number };
}

interface AtRiskTeam {
  id: string;
  name: string;
  metric: string;
  score: number;
  change: number;
  reason: string;
}

interface TopPerformer {
  id: string;
  name: string;
  metric: string;
  score: number;
  change: number;
  reason: string;
}

interface MetricDefinition {
  key: string;
  name: string;
  shortName: string;
  description: string;
}

const TeamTrends: React.FC = () => {
  console.log("🎯 TEAM TRENDS COMPONENT IS RENDERING! 🎯");
  
  // State
  const [timeRange, setTimeRange] = useState<TimeRange>("last-3-months");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<Metric>("all");
  const [selectedTeamForTrends, setSelectedTeamForTrends] = useState<string>("Marketing");
  const [sortBy, setSortBy] = useState<string>("team");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [hoveredCell, setHoveredCell] = useState<{teamId: string, metric: string} | null>(null);
  const [showSparkline, setShowSparkline] = useState<{teamId: string, metric: string} | null>(null);
  const [showTeamModal, setShowTeamModal] = useState<boolean>(false);
  const [selectedTeamForDrillDown, setSelectedTeamForDrillDown] = useState<string | null>(null);

  // Sparkline data for each team-metric combination
  const sparklineData = {
    "1-jobSatisfaction": [
      { month: "Jan", value: 7.8 }, { month: "Feb", value: 7.9 }, { month: "Mar", value: 8.0 },
      { month: "Apr", value: 8.1 }, { month: "May", value: 8.2 }, { month: "Jun", value: 8.2 }
    ],
    "1-managerRelationship": [
      { month: "Jan", value: 7.6 }, { month: "Feb", value: 7.7 }, { month: "Mar", value: 7.7 },
      { month: "Apr", value: 7.8 }, { month: "May", value: 7.8 }, { month: "Jun", value: 7.8 }
    ],
    "1-peerCollaboration": [
      { month: "Jan", value: 7.9 }, { month: "Feb", value: 8.1 }, { month: "Mar", value: 8.2 },
      { month: "Apr", value: 8.3 }, { month: "May", value: 8.4 }, { month: "Jun", value: 8.5 }
    ],
    "2-jobSatisfaction": [
      { month: "Jan", value: 7.5 }, { month: "Feb", value: 7.6 }, { month: "Mar", value: 7.7 },
      { month: "Apr", value: 7.7 }, { month: "May", value: 7.8 }, { month: "Jun", value: 7.8 }
    ],
    "3-jobSatisfaction": [
      { month: "Jan", value: 7.1 }, { month: "Feb", value: 7.0 }, { month: "Mar", value: 7.0 },
      { month: "Apr", value: 6.9 }, { month: "May", value: 6.9 }, { month: "Jun", value: 6.9 }
    ],
    // Add more sparkline data for other combinations...
  };

  // Metric definitions
  const metrics: MetricDefinition[] = [
    { key: "jobSatisfaction", name: "Job Satisfaction + Happiness", shortName: "Job", description: "How satisfied and happy are you with your current role?" },
    { key: "enps", name: "eNPS", shortName: "eNPS", description: "How likely are you to recommend this company as a place to work?" },
    { key: "managerRelationship", name: "Manager Relationship", shortName: "Mgr", description: "How would you rate your relationship with your manager?" },
    { key: "peerCollaboration", name: "Peer Collaboration", shortName: "Collab", description: "How well do you collaborate with your peers?" },
    { key: "recognition", name: "Recognition", shortName: "Recog", description: "Do you feel recognized for your contributions?" },
    { key: "careerGrowth", name: "Career Growth", shortName: "Growth", description: "Do you see opportunities for growth in your role?" },
    { key: "valueAlignment", name: "Value Alignment", shortName: "Values", description: "How well do your personal values align with the company?" },
    { key: "communication", name: "Communication", shortName: "Comm", description: "How effective is communication within your team?" },
    { key: "workEnvironment", name: "Work Environment", shortName: "Env", description: "How would you rate your work environment?" },
    { key: "healthWellness", name: "Health & Wellness", shortName: "Health", description: "How well does the company support your health and wellness?" },
    { key: "engagement", name: "Engagement", shortName: "Engage", description: "How engaged do you feel in your work?" }
  ];

  // Mock data
  const teamData: TeamData[] = [
    { id: "1", name: "Engineering", avgScore: 8.2, trend: 0.4, participationRate: 95, responseRate: 87, status: 'improving' },
    { id: "2", name: "Marketing", avgScore: 7.8, trend: 0.3, participationRate: 92, responseRate: 84, status: 'improving' },
    { id: "3", name: "Sales", avgScore: 6.9, trend: -0.2, participationRate: 88, responseRate: 76, status: 'declining' },
    { id: "4", name: "Product", avgScore: 7.5, trend: 0.1, participationRate: 90, responseRate: 82, status: 'stable' },
    { id: "5", name: "HR", avgScore: 7.9, trend: 0.5, participationRate: 94, responseRate: 89, status: 'improving' },
    { id: "6", name: "Finance", avgScore: 6.8, trend: -0.1, participationRate: 85, responseRate: 73, status: 'declining' },
    { id: "7", name: "Operations", avgScore: 7.2, trend: 0.2, participationRate: 89, responseRate: 78, status: 'improving' },
    { id: "8", name: "Design", avgScore: 7.6, trend: 0.3, participationRate: 91, responseRate: 85, status: 'improving' },
  ];

  const heatmapData: HeatmapData[] = [
    {
      teamId: "1", teamName: "Engineering", participationRate: 95,
      jobSatisfaction: { score: 8.2, trend: 0.4, responseRate: 87 },
      enps: { score: 8.3, trend: 0.4, responseRate: 88 },
      managerRelationship: { score: 7.8, trend: 0.2, responseRate: 85 },
      peerCollaboration: { score: 8.5, trend: 0.6, responseRate: 89 },
      recognition: { score: 7.9, trend: 0.3, responseRate: 83 },
      careerGrowth: { score: 8.1, trend: 0.5, responseRate: 86 },
      valueAlignment: { score: 8.0, trend: 0.3, responseRate: 84 },
      communication: { score: 7.7, trend: 0.2, responseRate: 82 },
      workEnvironment: { score: 8.4, trend: 0.4, responseRate: 87 },
      healthWellness: { score: 7.6, trend: 0.3, responseRate: 81 },
      engagement: { score: 8.2, trend: 0.5, responseRate: 86 }
    },
    {
      teamId: "2", teamName: "Marketing", participationRate: 92,
      jobSatisfaction: { score: 7.8, trend: 0.3, responseRate: 84 },
      enps: { score: 7.9, trend: 0.3, responseRate: 85 },
      managerRelationship: { score: 7.5, trend: 0.1, responseRate: 82 },
      peerCollaboration: { score: 7.8, trend: 0.4, responseRate: 86 },
      recognition: { score: 7.2, trend: -0.1, responseRate: 79 },
      careerGrowth: { score: 7.6, trend: 0.2, responseRate: 81 },
      valueAlignment: { score: 7.9, trend: 0.4, responseRate: 83 },
      communication: { score: 7.4, trend: 0.2, responseRate: 80 },
      workEnvironment: { score: 7.8, trend: 0.3, responseRate: 84 },
      healthWellness: { score: 7.3, trend: 0.2, responseRate: 78 },
      engagement: { score: 7.7, trend: 0.4, responseRate: 82 }
    },
    {
      teamId: "3", teamName: "Sales", participationRate: 88,
      jobSatisfaction: { score: 6.9, trend: -0.2, responseRate: 76 },
      enps: { score: 6.3, trend: -0.3, responseRate: 77 },
      managerRelationship: { score: 6.5, trend: -0.3, responseRate: 73 },
      peerCollaboration: { score: 6.2, trend: -0.4, responseRate: 71 },
      recognition: { score: 5.8, trend: -0.5, responseRate: 68 },
      careerGrowth: { score: 6.1, trend: -0.2, responseRate: 74 },
      valueAlignment: { score: 6.7, trend: -0.1, responseRate: 75 },
      communication: { score: 6.4, trend: -0.3, responseRate: 72 },
      workEnvironment: { score: 6.8, trend: -0.2, responseRate: 76 },
      healthWellness: { score: 6.2, trend: -0.4, responseRate: 70 },
      engagement: { score: 6.5, trend: -0.3, responseRate: 73 }
    },
    {
      teamId: "4", teamName: "Product", participationRate: 90,
      jobSatisfaction: { score: 7.5, trend: 0.1, responseRate: 82 },
      enps: { score: 7.7, trend: 0.2, responseRate: 84 },
      managerRelationship: { score: 7.8, trend: 0.2, responseRate: 85 },
      peerCollaboration: { score: 7.6, trend: 0.3, responseRate: 83 },
      recognition: { score: 7.3, trend: 0.0, responseRate: 80 },
      careerGrowth: { score: 7.9, trend: 0.4, responseRate: 87 },
      valueAlignment: { score: 7.6, trend: 0.2, responseRate: 81 },
      communication: { score: 7.5, trend: 0.3, responseRate: 82 },
      workEnvironment: { score: 7.7, trend: 0.2, responseRate: 83 },
      healthWellness: { score: 7.4, trend: 0.1, responseRate: 79 },
      engagement: { score: 7.6, trend: 0.3, responseRate: 84 }
    },
    {
      teamId: "5", teamName: "HR", participationRate: 94,
      jobSatisfaction: { score: 7.9, trend: 0.5, responseRate: 89 },
      enps: { score: 8.2, trend: 0.5, responseRate: 90 },
      managerRelationship: { score: 8.3, trend: 0.4, responseRate: 91 },
      peerCollaboration: { score: 8.1, trend: 0.3, responseRate: 88 },
      recognition: { score: 7.8, trend: 0.2, responseRate: 85 },
      careerGrowth: { score: 8.0, trend: 0.4, responseRate: 87 },
      valueAlignment: { score: 8.4, trend: 0.6, responseRate: 92 },
      communication: { score: 8.0, trend: 0.3, responseRate: 86 },
      workEnvironment: { score: 8.1, trend: 0.4, responseRate: 88 },
      healthWellness: { score: 8.3, trend: 0.5, responseRate: 89 },
      engagement: { score: 8.2, trend: 0.5, responseRate: 90 }
    },
    {
      teamId: "6", teamName: "Finance", participationRate: 85,
      jobSatisfaction: { score: 6.8, trend: -0.1, responseRate: 73 },
      enps: { score: 6.7, trend: -0.2, responseRate: 74 },
      managerRelationship: { score: 7.2, trend: 0.0, responseRate: 78 },
      peerCollaboration: { score: 6.8, trend: -0.2, responseRate: 75 },
      recognition: { score: 6.5, trend: -0.3, responseRate: 72 },
      careerGrowth: { score: 6.9, trend: -0.1, responseRate: 76 },
      valueAlignment: { score: 7.1, trend: 0.0, responseRate: 77 },
      communication: { score: 6.9, trend: -0.2, responseRate: 74 },
      workEnvironment: { score: 7.0, trend: -0.1, responseRate: 75 },
      healthWellness: { score: 6.6, trend: -0.3, responseRate: 71 },
      engagement: { score: 6.8, trend: -0.2, responseRate: 73 }
    }
  ];

  const atRiskTeams: AtRiskTeam[] = [
    { id: "1", name: "Sales", metric: "Peer Collaboration", score: 6.2, change: -1.2, reason: "Team communication issues" },
    { id: "2", name: "Finance", metric: "Recognition", score: 6.5, change: -0.8, reason: "Process improvement needed" },
    { id: "3", name: "Sales", metric: "Recognition", score: 5.8, change: -0.5, reason: "Recognition program gaps" },
  ];

  const topPerformers: TopPerformer[] = [
    { id: "1", name: "Engineering", metric: "Peer Collaboration", score: 8.5, change: 1.1, reason: "Cross-team projects success" },
    { id: "2", name: "HR", metric: "Manager Relationship", score: 8.3, change: 0.9, reason: "New management initiatives" },
    { id: "3", name: "Marketing", metric: "Career Growth", score: 7.6, change: 0.7, reason: "Career development programs" },
  ];

  // Trend data for line chart
  const trendData = [
    { month: "Jan", Marketing: 7.2, Engineering: 7.8, Sales: 7.1, Product: 7.3, HR: 7.5, Finance: 6.9, Operations: 7.0, Design: 7.4 },
    { month: "Feb", Marketing: 7.4, Engineering: 7.9, Sales: 7.0, Product: 7.4, HR: 7.6, Finance: 6.8, Operations: 7.1, Design: 7.5 },
    { month: "Mar", Marketing: 7.6, Engineering: 8.0, Sales: 6.9, Product: 7.5, HR: 7.7, Finance: 6.7, Operations: 7.2, Design: 7.6 },
    { month: "Apr", Marketing: 7.8, Engineering: 8.2, Sales: 6.8, Product: 7.6, HR: 7.9, Finance: 6.6, Operations: 7.3, Design: 7.7 },
    { month: "May", Marketing: 7.9, Engineering: 8.3, Sales: 6.7, Product: 7.7, HR: 8.0, Finance: 6.5, Operations: 7.4, Design: 7.8 },
    { month: "Jun", Marketing: 8.0, Engineering: 8.4, Sales: 6.6, Product: 7.8, HR: 8.1, Finance: 6.4, Operations: 7.5, Design: 7.9 },
  ];

  // Helper functions
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "bg-green-700 text-white"; // Dark Green (thriving)
    if (score >= 7) return "bg-green-500 text-white"; // Light Green (healthy)
    if (score >= 5) return "bg-yellow-500 text-black"; // Yellow (watch zone)
    return "bg-red-500 text-white"; // Red (risk zone)
  };

  const getBorderColor = (score: number) => {
    if (score < 6) return "border-red-500 border-2"; // Auto-flag for scores below 6
    return "border-gray-200";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return <ArrowUp className="w-3 h-3 text-green-600" />;
    if (trend < -0.1) return <ArrowDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getTrendText = (trend: number) => {
    if (trend > 0) return `+${trend.toFixed(1)}`;
    return trend.toFixed(1);
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const handleColumnSort = (metricKey: string) => {
    if (sortBy === metricKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(metricKey);
      setSortDirection("desc");
    }
  };

  // Filtered data based on selections
  const filteredTeamData = useMemo(() => {
    let filtered = teamData;
    
    // Filter by team
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(team => team.id === selectedTeam);
    }
    
    // Filter by metric (this would affect the leaderboard display)
    // For now, we'll keep all teams but could add metric-specific filtering
    
    return filtered;
  }, [teamData, selectedTeam, selectedMetric]);

  const filteredHeatmapData = useMemo(() => {
    let filtered = heatmapData;
    
    // Filter by team
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(team => team.teamId === selectedTeam);
    }
    
    // Filter by metric (this would affect which columns are shown)
    // For now, we'll keep all metrics but could add metric-specific filtering
    
    return filtered;
  }, [heatmapData, selectedTeam, selectedMetric]);

  // Filtered at-risk and top performers
  const filteredAtRiskTeams = useMemo(() => {
    if (selectedTeam !== 'all') {
      return atRiskTeams.filter(team => team.id === selectedTeam);
    }
    return atRiskTeams;
  }, [atRiskTeams, selectedTeam]);

  const filteredTopPerformers = useMemo(() => {
    if (selectedTeam !== 'all') {
      return topPerformers.filter(team => team.id === selectedTeam);
    }
    return topPerformers;
  }, [topPerformers, selectedTeam]);

  // Handle team click for drill-down
  const handleTeamClick = (teamId: string) => {
    setSelectedTeamForDrillDown(teamId);
    setShowTeamModal(true);
    setAlertType(null); // Clear alert type for team drill-down
  };

  // Handle view button clicks for alerts
  const handleViewAlert = (teamId: string, type: 'risk' | 'performer') => {
    setSelectedTeamForDrillDown(teamId);
    setAlertType(type);
    setShowTeamModal(true);
  };

  // State for alert type
  const [alertType, setAlertType] = useState<'risk' | 'performer' | null>(null);

  const handleExportCSV = () => {
    console.log("Exporting CSV...");
  };

  const handleExportPDF = () => {
    console.log("Exporting PDF...");
  };

  const sortedData = useMemo(() => {
    if (sortBy === "team") {
      return [...heatmapData].sort((a, b) => a.teamName.localeCompare(b.teamName));
    }
    
    return [...heatmapData].sort((a, b) => {
      const aScore = a[sortBy as keyof HeatmapData] as { score: number };
      const bScore = b[sortBy as keyof HeatmapData] as { score: number };
      
      if (sortDirection === "desc") {
        return bScore.score - aScore.score;
      }
      return aScore.score - bScore.score;
    });
  }, [heatmapData, sortBy, sortDirection]);

  // Calculate averages for footer row
  const averages = useMemo(() => {
    const avg = {
      jobSatisfaction: 0,
      enps: 0,
      managerRelationship: 0,
      peerCollaboration: 0,
      recognition: 0,
      careerGrowth: 0,
      valueAlignment: 0,
      communication: 0,
      workEnvironment: 0,
      healthWellness: 0,
      engagement: 0
    };
    
    heatmapData.forEach(team => {
      avg.jobSatisfaction += team.jobSatisfaction.score;
      avg.enps += team.enps.score;
      avg.managerRelationship += team.managerRelationship.score;
      avg.peerCollaboration += team.peerCollaboration.score;
      avg.recognition += team.recognition.score;
      avg.careerGrowth += team.careerGrowth.score;
      avg.valueAlignment += team.valueAlignment.score;
      avg.communication += team.communication.score;
      avg.workEnvironment += team.workEnvironment.score;
      avg.healthWellness += team.healthWellness.score;
      avg.engagement += team.engagement.score;
    });
    
    const count = heatmapData.length;
    return {
      jobSatisfaction: avg.jobSatisfaction / count,
      enps: avg.enps / count,
      managerRelationship: avg.managerRelationship / count,
      peerCollaboration: avg.peerCollaboration / count,
      recognition: avg.recognition / count,
      careerGrowth: avg.careerGrowth / count,
      valueAlignment: avg.valueAlignment / count,
      communication: avg.communication / count,
      workEnvironment: avg.workEnvironment / count,
      healthWellness: avg.healthWellness / count,
      engagement: avg.engagement / count
    };
  }, [heatmapData]);

  return (
    <div className="space-y-6 p-6">
      {/* Team Overview Board with Filters */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <BarChart3 className="w-6 h-6 text-gray-700" />
                Teamboard
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Comprehensive overview of all teams and their performance metrics
              </CardDescription>
            </div>
            
            {/* Premium Filters */}
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Time Range</Label>
                <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                  <SelectTrigger className="h-10 w-36 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="h-10 w-40 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teamData.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Metric</Label>
                <Select value={selectedMetric} onValueChange={(value: Metric) => setSelectedMetric(value)}>
                  <SelectTrigger className="h-10 w-40 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    {metrics.map(metric => (
                      <SelectItem key={metric.key} value={metric.key}>{metric.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTeamData.slice(0, 8).map((team, index) => (
              <div 
                key={team.id} 
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                onClick={() => handleTeamClick(team.id)}
              >
                {/* Team Content */}
                <div className="p-5 space-y-4">
                  {/* Team Header */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{team.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        team.avgScore >= 8.5 ? 'bg-emerald-500' :
                        team.avgScore >= 7 ? 'bg-blue-500' :
                        team.avgScore >= 5 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {team.avgScore >= 8.5 ? 'Thriving' :
                         team.avgScore >= 7 ? 'Healthy' :
                         team.avgScore >= 5 ? 'Watch' : 'Risk'}
                      </span>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="text-center py-3 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{team.avgScore.toFixed(1)}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Average Score</div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        team.trend > 0 ? 'text-emerald-600' : team.trend < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {team.trend > 0 ? '+' : ''}{team.trend.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Trend</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{team.participationRate}%</div>
                      <div className="text-xs text-gray-500 font-medium">Participation</div>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </div>
            ))}
          </div>
          
          {/* Premium View All Button */}
          {filteredTeamData.length > 8 && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                className="px-8 py-3 text-sm font-semibold rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                View All {filteredTeamData.length} Teams
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5" />
                Team Performance Heatmap
              </CardTitle>
              <CardDescription className="mb-4">
                Click on column headers to sort by metric. Hover for details. Click team names for drill-down.
              </CardDescription>
            </div>
            
            {/* Performance Zones Legend - Top Right */}
            <div className="flex flex-col gap-2 text-xs">
              <span className="font-semibold text-gray-700">Performance Zones</span>
              <div className="flex gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#F94144] rounded"></div>
                  <span>0-5: Risk</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span>5-7: Watch</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#90BE6D] rounded"></div>
                  <span>7-8.5: Healthy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#43AA8B] rounded"></div>
                  <span>8.5-10: Thriving</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-[#D62828] bg-white rounded"></div>
                  <span>Red border: &lt;6</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b-2 border-gray-300">
                  <th className="sticky left-0 bg-white z-20 text-left p-3 font-semibold text-gray-700 min-w-[160px] border-r border-gray-200">
                    Team
                  </th>
                  {metrics.map(metric => (
                    <th 
                      key={metric.key}
                      className="text-center p-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors min-w-[90px] border-r border-gray-200 last:border-r-0"
                      onClick={() => handleColumnSort(metric.key)}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-medium leading-tight">{metric.shortName}</span>
                              <Info className="w-3 h-3 text-gray-400" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="font-semibold mb-1">{metric.name}</p>
                            <p className="text-sm">{metric.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHeatmapData.map(team => (
                  <tr key={team.teamId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="sticky left-0 bg-white z-10 p-3 border-r border-gray-200">
                      <div 
                        className="flex flex-col cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleTeamClick(team.teamId)}
                      >
                        <span className="font-bold text-gray-900 text-sm">{team.teamName}</span>
                        <span className="text-xs text-gray-500">{team.participationRate}%</span>
                      </div>
                    </td>
                    {metrics.map(metric => {
                      const data = team[metric.key as keyof HeatmapData] as { score: number; trend: number; responseRate: number };
                      
                      // Enhanced color coding based on spec
                      const getScoreColor = (score: number) => {
                        if (score >= 8.5) return "bg-[#43AA8B] text-white"; // Deep green
                        if (score >= 7) return "bg-[#90BE6D] text-white"; // Light green
                        if (score >= 5) return "bg-yellow-400 text-gray-900"; // Yellow
                        return "bg-[#F94144] text-white"; // Strong red
                      };

                      // Border for risk scores
                      const getBorderStyle = (score: number) => {
                        if (score < 6) return "border-2 border-[#D62828]"; // Red border for risks
                        return "border border-gray-200";
                      };

                      // Enhanced trend arrow
                      const getTrendArrow = (trend: number) => {
                        if (trend > 0.1) return <span className="text-green-600 text-xs">↑</span>;
                        if (trend < -0.1) return <span className="text-red-600 text-xs">↓</span>;
                        return <span className="text-gray-400 text-xs">→</span>;
                      };

                      const getTrendText = (trend: number) => {
                        if (trend > 0) return `↑+${trend.toFixed(1)}`;
                        if (trend < 0) return `↓${trend.toFixed(1)}`;
                        return `→${trend.toFixed(1)}`;
                      };
                      
                      return (
                        <td key={metric.key} className="p-1 border-r border-gray-200 last:border-r-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`rounded p-2 text-center cursor-pointer transition-all ${getScoreColor(data.score)} ${getBorderStyle(data.score)}`}
                                  onMouseEnter={() => setHoveredCell({teamId: team.teamId, metric: metric.key})}
                                  onMouseLeave={() => setHoveredCell(null)}
                                >
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="font-bold text-sm">{data.score.toFixed(1)}</span>
                                    {getTrendArrow(data.trend)}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-gray-900 text-white p-3">
                                <div className="space-y-1 text-sm">
                                  <p className="font-semibold">{team.teamName}</p>
                                  <p className="font-semibold">{metric.name}</p>
                                  <p>Score: {data.score.toFixed(1)}/10</p>
                                  <p>Trend: {getTrendText(data.trend)} vs last month</p>
                                  <p>Participation: {data.responseRate}%</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {/* Footer Row - Org Average */}
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="sticky left-0 bg-gray-50 z-10 p-3 border-r border-gray-200">
                    <div className="flex flex-col">
                      <span className="font-bold italic text-gray-900 text-sm">Org Avg</span>
                      <span className="text-xs text-gray-500">All teams</span>
                    </div>
                  </td>
                  {metrics.map(metric => {
                    const avgScore = averages[metric.key as keyof typeof averages];
                    
                    // Use same color coding for averages
                    const getScoreColor = (score: number) => {
                      if (score >= 8.5) return "bg-[#43AA8B] text-white"; // Deep green
                      if (score >= 7) return "bg-[#90BE6D] text-white"; // Light green
                      if (score >= 5) return "bg-yellow-400 text-gray-900"; // Yellow
                      return "bg-[#F94144] text-white"; // Strong red
                    };
                    
                    return (
                      <td key={metric.key} className="p-1 border-r border-gray-200 last:border-r-0">
                        <div className={`rounded p-2 text-center font-bold italic text-sm ${getScoreColor(avgScore)}`}>
                          {avgScore.toFixed(1)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers and At-Risk Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Teams */}
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              At-Risk Teams
            </CardTitle>
            <CardDescription>Teams that need immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAtRiskTeams.map(team => (
                <div key={team.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-800">{team.name}</h4>
                      <p className="text-sm text-red-600">
                        {team.metric} dropped {Math.abs(team.change).toFixed(1)} this month
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewAlert(team.id, 'risk')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Performers
            </CardTitle>
            <CardDescription>Teams showing exceptional improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTopPerformers.map(team => (
                <div key={team.id} className="p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800">{team.name}</h4>
                      <p className="text-sm text-green-600">
                        {team.metric} improved +{team.change.toFixed(1)} this month
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewAlert(team.id, 'performer')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="rounded-2xl border border-gray-200 bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Trend Analysis
          </CardTitle>
          <CardDescription>Track how team scores have evolved over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="trend-team">Select Team</Label>
            <Select value={selectedTeamForTrends} onValueChange={setSelectedTeamForTrends}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamData.map(team => (
                  <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[6, 9]} />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey={selectedTeamForTrends} 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Team Drill-Down Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurry backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowTeamModal(false)}></div>
          
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    alertType === 'risk' ? 'bg-red-100 text-red-600' : 
                    alertType === 'performer' ? 'bg-green-100 text-green-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {alertType === 'risk' ? <AlertTriangle className="w-5 h-5" /> : 
                     alertType === 'performer' ? <Trophy className="w-5 h-5" /> : 
                     <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {heatmapData.find(t => t.teamId === selectedTeamForDrillDown)?.teamName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {alertType === 'risk' ? 'At-Risk Alert' : 
                       alertType === 'performer' ? 'Top Performer Alert' : 
                       'Team Performance Overview'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowTeamModal(false)}
                >
                  ✕
                </Button>
              </div>
              
              {/* Team Metrics Overview (when clicking team card) */}
              {!alertType && (
                <div className="space-y-4">
                  {(() => {
                    const team = heatmapData.find(t => t.teamId === selectedTeamForDrillDown);
                    if (!team) return null;
                    
                    return (
                      <div className="space-y-4">
                        {/* Team Summary */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-3">Team Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Participation Rate:</span>
                              <span className="font-bold text-blue-800">{team.participationRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Overall Status:</span>
                              <span className="font-bold text-blue-800">
                                {team.jobSatisfaction.score >= 8.5 ? 'Thriving' :
                                 team.jobSatisfaction.score >= 7 ? 'Healthy' :
                                 team.jobSatisfaction.score >= 5 ? 'Watch' : 'Risk'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* All Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {metrics.map(metric => {
                            const data = team[metric.key as keyof HeatmapData] as { score: number; trend: number; responseRate: number };
                            return (
                              <div key={metric.key} className="p-3 border border-gray-200 rounded-lg bg-white">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900 text-sm">{metric.name}</h5>
                                  <div className={`w-3 h-3 rounded-full ${
                                    data.score >= 8.5 ? 'bg-[#43AA8B]' :
                                    data.score >= 7 ? 'bg-[#90BE6D]' :
                                    data.score >= 5 ? 'bg-yellow-400' :
                                    'bg-[#F94144]'
                                  }`}></div>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Score:</span>
                                    <span className="font-bold text-gray-900">{data.score.toFixed(1)}/10</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Trend:</span>
                                    <span className={`font-bold ${data.trend > 0 ? 'text-green-600' : data.trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                      {data.trend > 0 ? '+' : ''}{data.trend.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Response Rate:</span>
                                    <span className="font-bold text-gray-900">{data.responseRate}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {alertType === 'risk' && (
                <div className="space-y-4">
                  {(() => {
                    const riskTeam = atRiskTeams.find(t => t.id === selectedTeamForDrillDown);
                    if (!riskTeam) return null;
                    return (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-3">Risk Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-red-700">Metric:</span>
                            <span className="font-bold text-red-800">{riskTeam.metric}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-700">Score Drop:</span>
                            <span className="font-bold text-red-800">-{Math.abs(riskTeam.change).toFixed(1)} points</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-700">Current Score:</span>
                            <span className="font-bold text-red-800">{riskTeam.score.toFixed(1)}/10</span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-red-100 rounded">
                          <p className="text-red-800 text-sm">{riskTeam.reason}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {alertType === 'performer' && (
                <div className="space-y-4">
                  {(() => {
                    const performerTeam = topPerformers.find(t => t.id === selectedTeamForDrillDown);
                    if (!performerTeam) return null;
                    return (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-3">Performance Highlights</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Metric:</span>
                            <span className="font-bold text-green-800">{performerTeam.metric}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Improvement:</span>
                            <span className="font-bold text-green-800">+{performerTeam.change.toFixed(1)} points</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Current Score:</span>
                            <span className="font-bold text-green-800">{performerTeam.score.toFixed(1)}/10</span>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-green-100 rounded">
                          <p className="text-green-800 text-sm">{performerTeam.reason}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowTeamModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTrends;


