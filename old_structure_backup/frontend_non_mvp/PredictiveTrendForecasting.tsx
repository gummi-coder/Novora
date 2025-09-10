import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  BarChart3,
  LineChart,
  Grid3X3,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Target
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TrendData {
  date: string;
  overall: number;
  sales: number;
  marketing: number;
  engineering: number;
  hr: number;
}

interface ParticipationData {
  date: string;
  overall: number;
  sales: number;
  marketing: number;
  engineering: number;
  hr: number;
}

interface HeatmapData {
  team: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
}

interface Team {
  id: string;
  name: string;
  color: string;
}

const PredictiveTrendForecasting = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [selectedTeams, setSelectedTeams] = useState<string[]>(['overall']);
  const [dateRange, setDateRange] = useState('6months');
  const [questionType, setQuestionType] = useState('all');
  const [viewType, setViewType] = useState('overall');
  
  // Data state
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [participationData, setParticipationData] = useState<ParticipationData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        
        // Mock trend data
        const mockTrendData: TrendData[] = [
          { date: 'Jan', overall: 7.2, sales: 6.8, marketing: 7.5, engineering: 7.8, hr: 7.1 },
          { date: 'Feb', overall: 7.4, sales: 7.0, marketing: 7.6, engineering: 7.9, hr: 7.2 },
          { date: 'Mar', overall: 7.1, sales: 6.5, marketing: 7.3, engineering: 7.7, hr: 7.0 },
          { date: 'Apr', overall: 7.6, sales: 7.2, marketing: 7.8, engineering: 8.1, hr: 7.4 },
          { date: 'May', overall: 7.8, sales: 7.5, marketing: 8.0, engineering: 8.3, hr: 7.6 },
          { date: 'Jun', overall: 7.3, sales: 6.9, marketing: 7.4, engineering: 7.8, hr: 7.1 },
        ];
        setTrendData(mockTrendData);

        // Mock participation data
        const mockParticipationData: ParticipationData[] = [
          { date: 'Jan', overall: 75, sales: 70, marketing: 80, engineering: 85, hr: 72 },
          { date: 'Feb', overall: 78, sales: 73, marketing: 82, engineering: 87, hr: 75 },
          { date: 'Mar', overall: 72, sales: 68, marketing: 78, engineering: 83, hr: 70 },
          { date: 'Apr', overall: 81, sales: 76, marketing: 85, engineering: 90, hr: 78 },
          { date: 'May', overall: 84, sales: 79, marketing: 88, engineering: 92, hr: 81 },
          { date: 'Jun', overall: 76, sales: 71, marketing: 80, engineering: 85, hr: 73 },
        ];
        setParticipationData(mockParticipationData);

        // Mock heatmap data
        const mockHeatmapData: HeatmapData[] = [
          { team: 'Sales', jan: 6.8, feb: 7.0, mar: 6.5, apr: 7.2, may: 7.5, jun: 6.9 },
          { team: 'Marketing', jan: 7.5, feb: 7.6, mar: 7.3, apr: 7.8, may: 8.0, jun: 7.4 },
          { team: 'Engineering', jan: 7.8, feb: 7.9, mar: 7.7, apr: 8.1, may: 8.3, jun: 7.8 },
          { team: 'HR', jan: 7.1, feb: 7.2, mar: 7.0, apr: 7.4, may: 7.6, jun: 7.1 },
        ];
        setHeatmapData(mockHeatmapData);

        // Teams data
        setTeams([
          { id: 'overall', name: 'Overall', color: '#3b82f6' },
          { id: 'sales', name: 'Sales', color: '#ef4444' },
          { id: 'marketing', name: 'Marketing', color: '#10b981' },
          { id: 'engineering', name: 'Engineering', color: '#f59e0b' },
          { id: 'hr', name: 'HR', color: '#8b5cf6' },
        ]);

      } catch (error) {
        console.error('Error fetching trends data:', error);
        toast({
          title: "Error",
          description: "Failed to load trends data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, [toast]);

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return '#10b981'; // green
    if (score >= 6.0) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreBackground = (score: number) => {
    if (score >= 7.5) return 'bg-green-100 text-green-800';
    if (score >= 6.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Trends data is being exported to CSV",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trends</h1>
          <p className="text-gray-600 mt-1">Explore team sentiment over time and spot patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Team Selector */}
            <div className="space-y-2">
              <Label>Teams</Label>
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={team.id}
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={() => handleTeamToggle(team.id)}
                    />
                    <Label htmlFor={team.id} className="text-sm">
                      {team.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="satisfaction">Job Satisfaction</SelectItem>
                  <SelectItem value="culture">Company Culture</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="workload">Workload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Type */}
            <div className="space-y-2">
              <Label>View Type</Label>
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="per-question">Per Question</SelectItem>
                  <SelectItem value="per-department">Per Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="w-5 h-5" />
            <span>Sentiment Trend</span>
          </CardTitle>
          <CardDescription>Average scores over time by team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[5, 10]}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`${value}/10`, 'Score']}
                />
                {selectedTeams.map((teamId) => {
                  const team = teams.find(t => t.id === teamId);
                  if (!team) return null;
                  return (
                    <Line
                      key={teamId}
                      type="monotone"
                      dataKey={teamId}
                      stroke={team.color}
                      strokeWidth={3}
                      dot={{ fill: team.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: team.color, strokeWidth: 2 }}
                      name={team.name}
                    />
                  );
                })}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Participation Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Participation Trend</span>
          </CardTitle>
          <CardDescription>Response rates over time by team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={participationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Participation']}
                />
                {selectedTeams.map((teamId) => {
                  const team = teams.find(t => t.id === teamId);
                  if (!team) return null;
                  return (
                    <Line
                      key={teamId}
                      type="monotone"
                      dataKey={teamId}
                      stroke={team.color}
                      strokeWidth={3}
                      dot={{ fill: team.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: team.color, strokeWidth: 2 }}
                      name={team.name}
                    />
                  );
                })}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5" />
            <span>Sentiment Heatmap</span>
          </CardTitle>
          <CardDescription>Team sentiment by month (green/yellow/red)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">Jan</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">Feb</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">Mar</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">Apr</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">May</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-600">Jun</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row) => (
                  <tr key={row.team} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.team}</td>
                    {['jan', 'feb', 'mar', 'apr', 'may', 'jun'].map((month) => {
                      const score = row[month as keyof HeatmapData] as number;
                      return (
                        <td key={month} className="py-3 px-2 text-center">
                          <div 
                            className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getScoreBackground(score)}`}
                            style={{ backgroundColor: getScoreColor(score) + '20' }}
                          >
                            {score.toFixed(1)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-sm text-gray-600">High (≥7.5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span className="text-sm text-gray-600">Medium (6.0-7.4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-sm text-gray-600">Low (&lt;6.0)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveTrendForecasting; 