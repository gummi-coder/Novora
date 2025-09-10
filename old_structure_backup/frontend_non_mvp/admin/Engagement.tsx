import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  BarChart3,
  Download, 
  Filter,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

// Types
interface ParticipationKPI {
  title: string;
  value: string;
  change: number;
  changeText: string;
  icon: React.ReactNode;
  color: string;
  tooltip: string;
}

interface TeamParticipation {
  id: string;
  name: string;
  size: number;
  respondents: number;
  participationRate: number;
  trendChange: number;
  status: 'healthy' | 'low-engagement' | 'at-risk';
  department: string;
}

interface EngagementTrend {
  month: string;
  participation: number;
  allTeams: number;
}

interface HeatmapData {
  team: string;
  surveys: { [key: string]: number };
}

interface InsightWidget {
  type: 'low-participation' | 'champion' | 'correlation';
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}

// Mock Data
const participationKPIs: ParticipationKPI[] = [
  {
    title: 'Overall Participation Rate',
    value: '76%',
    change: 4,
    changeText: '+4% vs last survey',
    icon: <Users className="w-5 h-5" />,
    color: 'text-blue-600',
    tooltip: 'Percentage of employees who completed the most recent survey'
  },
  {
    title: 'Consistent Responders',
    value: '61%',
    change: 2,
    changeText: '+2% vs last period',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-600',
    tooltip: 'Employees who responded to the last 3 consecutive surveys'
  },
  {
    title: 'Drop-off Rate',
    value: '9%',
    change: -3,
    changeText: '-3% vs previous',
    icon: <TrendingDown className="w-5 h-5" />,
    color: 'text-orange-600',
    tooltip: 'Percentage of employees who skipped the last survey vs the previous one'
  },
  {
    title: 'Teams Below Threshold',
    value: '3',
    change: -1,
    changeText: '-1 team improved',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-red-600',
    tooltip: 'Number of teams with participation rate below 60%'
  }
];

const teamParticipationData: TeamParticipation[] = [
  { id: '1', name: 'Operations', size: 35, respondents: 17, participationRate: 49, trendChange: -12, status: 'at-risk', department: 'Operations' },
  { id: '2', name: 'Sales', size: 28, respondents: 15, participationRate: 54, trendChange: -8, status: 'at-risk', department: 'Revenue' },
  { id: '3', name: 'Finance', size: 18, respondents: 12, participationRate: 67, trendChange: -2, status: 'low-engagement', department: 'Finance' },
  { id: '4', name: 'Engineering', size: 45, respondents: 32, participationRate: 71, trendChange: -5, status: 'healthy', department: 'Technology' },
  { id: '5', name: 'Marketing', size: 22, respondents: 18, participationRate: 82, trendChange: 8, status: 'healthy', department: 'Revenue' },
  { id: '6', name: 'HR', size: 12, respondents: 10, participationRate: 83, trendChange: 3, status: 'healthy', department: 'Support' }
];

const engagementTrendData: EngagementTrend[] = [
  { month: 'Jan', participation: 72, allTeams: 72 },
  { month: 'Feb', participation: 75, allTeams: 75 },
  { month: 'Mar', participation: 78, allTeams: 78 },
  { month: 'Apr', participation: 76, allTeams: 76 },
  { month: 'May', participation: 79, allTeams: 79 },
  { month: 'Jun', participation: 76, allTeams: 76 }
];

const heatmapData: HeatmapData[] = [
  { team: 'Engineering', surveys: { jan: 75, feb: 78, mar: 82, apr: 79, may: 81, jun: 71 } },
  { team: 'Marketing', surveys: { jan: 80, feb: 85, mar: 88, apr: 82, may: 85, jun: 82 } },
  { team: 'HR', surveys: { jan: 85, feb: 88, mar: 90, apr: 87, may: 85, jun: 83 } },
  { team: 'Finance', surveys: { jan: 70, feb: 72, mar: 75, apr: 73, may: 70, jun: 67 } },
  { team: 'Sales', surveys: { jan: 68, feb: 72, mar: 70, apr: 65, may: 58, jun: 54 } },
  { team: 'Operations', surveys: { jan: 72, feb: 70, mar: 68, apr: 65, may: 58, jun: 49 } }
];

const insightWidgets: InsightWidget[] = [
  {
    type: 'low-participation',
    title: 'Low Participation Alert',
    description: 'Operations team at 49% (–12% vs last month)',
    color: 'text-red-600',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    type: 'champion',
    title: 'Engagement Champion',
    description: 'HR team 83% participation, 6 months running',
    color: 'text-green-600',
    icon: <Award className="w-5 h-5" />
  },
  {
    type: 'correlation',
    title: 'Engagement Impact',
    description: 'Teams with >80% participation have avg eNPS +12 points higher',
    color: 'text-blue-600',
    icon: <TrendingUp className="w-5 h-5" />
  }
];

export default function Engagement() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('last-6-months');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [sortBy, setSortBy] = useState('participationRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtered and sorted data
  const sortedTeamData = useMemo(() => {
    const sorted = [...teamParticipationData].sort((a, b) => {
      const aValue = a[sortBy as keyof TeamParticipation];
      const bValue = b[sortBy as keyof TeamParticipation];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    
    return sorted;
  }, [sortBy, sortDirection]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'low-engagement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'at-risk': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'low-engagement': return 'Low Engagement';
      case 'at-risk': return 'At Risk';
      default: return 'Unknown';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Participation data is being exported to CSV",
    });
  };

  const handleTeamDrillDown = (team: TeamParticipation) => {
    toast({
      title: "Team Drill-Down",
      description: `Opening detailed participation view for ${team.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Premium Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
          Engagement
        </h1>
        <p className="text-lg text-gray-600">
          Monitor survey participation and identify engagement trends across teams
        </p>
      </div>

      {/* Global Filters */}
      <Card className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-survey">Last Survey</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-gray-200">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExportData} variant="outline" className="bg-white/50 backdrop-blur-sm border-gray-200">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* 1. Participation Overview (KPI Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {participationKPIs.map((kpi, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center ${kpi.color}`}>
                          {kpi.icon}
                        </div>
                        <div className={`text-sm font-semibold ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                        <div className="text-sm text-gray-600">{kpi.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{kpi.changeText}</div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-3 bg-white border border-gray-200 shadow-lg rounded-xl">
                  <p className="text-sm">{kpi.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* 2. Participation by Team (Main Table) */}
        <Card className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Participation by Team</CardTitle>
                <CardDescription>Team-level engagement metrics sorted by participation rate</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-white/50 backdrop-blur-sm border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participationRate">Participation</SelectItem>
                    <SelectItem value="trendChange">Trend</SelectItem>
                    <SelectItem value="size">Team Size</SelectItem>
                    <SelectItem value="name">Team Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="bg-white/50 backdrop-blur-sm border-gray-200"
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Team Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Team Size</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Respondents</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Participation Rate</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Trend vs Last</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTeamData.map((team) => (
                    <tr 
                      key={team.id} 
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleTeamDrillDown(team)}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">{team.department}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-700">{team.size}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-700">{team.respondents}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">{team.participationRate}%</span>
                          <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                team.participationRate >= 70 ? 'bg-green-500' : 
                                team.participationRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(team.participationRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 text-sm font-semibold ${getTrendColor(team.trendChange)}`}>
                          {getTrendIcon(team.trendChange)}
                          {team.trendChange > 0 ? '+' : ''}{team.trendChange}%
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`px-3 py-1 text-xs font-semibold border-2 ${getStatusColor(team.status)}`}>
                          {getStatusText(team.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 3. Survey Engagement Trend (Chart) */}
        <Card className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Survey Engagement Trend</CardTitle>
                <CardDescription>Participation rate over time to identify survey fatigue patterns</CardDescription>
              </div>
              <Select value="all-teams" onValueChange={() => {}}>
                <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-teams">All Teams Average</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="participation" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 8 }}
                    activeDot={{ r: 10, stroke: '#3b82f6', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. Response Consistency Heatmap */}
        <Card className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Response Consistency Heatmap</CardTitle>
            <CardDescription>Team participation patterns across recent surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Team</th>
                    <th className="text-center py-4 px-3 font-semibold text-gray-700">Jan</th>
                    <th className="text-center py-4 px-3 font-semibold text-gray-700">Feb</th>
                    <th className="text-center py-4 px-3 font-semibold text-gray-700">Mar</th>
                    <th className="text-center py-4 px-3 font-semibold text-gray-700">Apr</th>
                    <th className="text-center py-4 px-3 font-semibold text-gray-700">May</th>
                    <th className="text-center py-4 px-3 font-semibold text-gray-700">Jun</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-4 font-semibold text-gray-900">{row.team}</td>
                      {Object.entries(row.surveys).map(([month, value], i) => (
                        <td key={i} className="py-4 px-3 text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`w-14 h-10 rounded-xl mx-auto flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all duration-200 hover:scale-110 shadow-md ${getHeatmapColor(value)}`}
                                >
                                  {value}%
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm p-3 bg-white border border-gray-200 shadow-lg rounded-xl">
                                <p className="text-sm">
                                  <strong>{row.team}</strong> - {month.charAt(0).toUpperCase() + month.slice(1)} Survey<br />
                                  Participation: {value}%<br />
                                  Status: {value >= 70 ? 'Healthy' : value >= 50 ? 'Low Engagement' : 'At Risk'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 5. Insights Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insightWidgets.map((widget, index) => (
            <Card key={index} className="rounded-3xl border-0 bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center ${widget.color}`}>
                    {widget.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">{widget.title}</h3>
                    <p className="text-sm text-gray-600">{widget.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 6. Engagement Drivers (Mini Analysis) */}
        <Card className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Engagement Drivers Analysis</CardTitle>
            <CardDescription>Understanding the correlation between participation and sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Key Correlations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                    <div>
                      <div className="font-semibold text-green-800">High Participation Impact</div>
                      <div className="text-sm text-green-600">Teams &gt;80% participation</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700">+12</div>
                      <div className="text-xs text-green-600">eNPS points higher</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                    <div>
                      <div className="font-semibold text-blue-800">Consistent Responders</div>
                      <div className="text-sm text-blue-600">3+ consecutive surveys</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-700">+8</div>
                      <div className="text-xs text-blue-600">avg score points</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/50">
                    <div>
                      <div className="font-semibold text-orange-800">Survey Fatigue Risk</div>
                      <div className="text-sm text-orange-600">Teams with declining trends</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-700">-15%</div>
                      <div className="text-xs text-orange-600">response quality</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200/50">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <div className="font-semibold text-red-800">Focus on At-Risk Teams</div>
                        <div className="text-sm text-red-600 mt-1">Operations and Sales teams need immediate attention</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-1" />
                      <div>
                        <div className="font-semibold text-yellow-800">Optimize Survey Timing</div>
                        <div className="text-sm text-yellow-600 mt-1">Consider reducing frequency for fatigued teams</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <div className="font-semibold text-green-800">Celebrate Champions</div>
                        <div className="text-sm text-green-600 mt-1">Share HR team's engagement best practices</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
