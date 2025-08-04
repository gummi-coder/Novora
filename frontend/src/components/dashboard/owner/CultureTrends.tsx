import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Building,
  Filter,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrendData {
  month: string;
  avgScore: number;
  teamsWithAlerts: number;
  totalTeams: number;
  participationRate: number;
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

interface CultureTrendsProps {
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
}

const CultureTrends = ({ dateRange = "Last 6 Months", onDateRangeChange }: CultureTrendsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'department' | 'team'>('department');
  const [questionType, setQuestionType] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(true);
  
  // Mock data for trends
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);

  useEffect(() => {
    const fetchCultureTrendsData = async () => {
      try {
        setLoading(true);
        
        // Mock trend data
        const mockTrendData: TrendData[] = [
          { month: 'Jan', avgScore: 7.1, teamsWithAlerts: 2, totalTeams: 12, participationRate: 75 },
          { month: 'Feb', avgScore: 7.3, teamsWithAlerts: 1, totalTeams: 12, participationRate: 78 },
          { month: 'Mar', avgScore: 7.0, teamsWithAlerts: 3, totalTeams: 12, participationRate: 72 },
          { month: 'Apr', avgScore: 7.4, teamsWithAlerts: 1, totalTeams: 12, participationRate: 80 },
          { month: 'May', avgScore: 7.2, teamsWithAlerts: 2, totalTeams: 12, participationRate: 77 },
          { month: 'Jun', avgScore: 7.5, teamsWithAlerts: 1, totalTeams: 12, participationRate: 82 }
        ];
        setTrendData(mockTrendData);

        // Mock heatmap data
        const mockHeatmapData: HeatmapData[] = [
          { team: 'Sales', jan: 6.8, feb: 7.0, mar: 6.5, apr: 7.2, may: 7.1, jun: 7.3 },
          { team: 'Engineering', jan: 7.5, feb: 7.6, mar: 7.3, apr: 7.8, may: 7.7, jun: 7.9 },
          { team: 'Marketing', jan: 7.0, feb: 7.1, mar: 6.8, apr: 7.3, may: 7.2, jun: 7.4 },
          { team: 'HR', jan: 8.0, feb: 8.1, mar: 7.8, apr: 8.3, may: 8.2, jun: 8.4 },
          { team: 'Finance', jan: 6.9, feb: 7.0, mar: 6.7, apr: 7.2, may: 7.1, jun: 7.3 },
          { team: 'Operations', jan: 7.2, feb: 7.3, mar: 7.0, apr: 7.5, may: 7.4, jun: 7.6 }
        ];
        setHeatmapData(mockHeatmapData);
        
      } catch (error) {
        console.error('Error fetching culture trends data:', error);
        toast({
          title: "Error",
          description: "Failed to load culture trends data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCultureTrendsData();
  }, [toast]);

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return '#10b981'; // green
    if (score >= 6.5) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getAlertPercentage = (teamsWithAlerts: number, totalTeams: number) => {
    return Math.round((teamsWithAlerts / totalTeams) * 100);
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Exporting culture trends data...",
    });
  };

  const handleViewModeChange = (mode: 'department' | 'team') => {
    setViewMode(mode);
    toast({
      title: "View Mode",
      description: `Switched to ${mode} view`,
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
          <h1 className="text-3xl font-bold text-gray-900">Culture Trends</h1>
          <p className="text-gray-600 mt-1">Visualize company culture over time</p>
        </div>
        <Button onClick={handleExport} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters & View Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={onDateRangeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                  <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                  <SelectItem value="Last Year">Last Year</SelectItem>
                  <SelectItem value="This Year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="space-y-2">
              <Label>View Mode</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={viewMode === 'department'}
                    onCheckedChange={() => handleViewModeChange('department')}
                  />
                  <Label>Department</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={viewMode === 'team'}
                    onCheckedChange={() => handleViewModeChange('team')}
                  />
                  <Label>Team</Label>
                </div>
              </div>
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
                  <SelectItem value="culture">Culture & Values</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="workplace">Workplace Environment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Average Score Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Average Score Trend</span>
            </CardTitle>
            <CardDescription>Organization-wide average score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[6, 9]} />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(1), 'Score']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Teams with Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5" />
              <span>Teams with Alerts</span>
            </CardTitle>
            <CardDescription>Percentage of teams with alerts per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Teams with Alerts']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey={(data) => getAlertPercentage(data.teamsWithAlerts, data.totalTeams)}
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Participation Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Participation Rate Trend</span>
          </CardTitle>
          <CardDescription>Employee participation rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[60, 90]} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Participation']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="participationRate" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Heatmap Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Performance Heatmap</h2>
          <p className="text-gray-600">Monthly scores by team (color-coded)</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="flex items-center space-x-2"
        >
          {showHeatmap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showHeatmap ? 'Hide' : 'Show'} Heatmap</span>
        </Button>
      </div>

      {/* Heatmap */}
      {showHeatmap && (
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium text-gray-700">Team</th>
                    <th className="text-center p-2 font-medium text-gray-700">Jan</th>
                    <th className="text-center p-2 font-medium text-gray-700">Feb</th>
                    <th className="text-center p-2 font-medium text-gray-700">Mar</th>
                    <th className="text-center p-2 font-medium text-gray-700">Apr</th>
                    <th className="text-center p-2 font-medium text-gray-700">May</th>
                    <th className="text-center p-2 font-medium text-gray-700">Jun</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((team) => (
                    <tr key={team.team} className="border-b border-gray-100">
                      <td className="p-2 font-medium text-gray-900">{team.team}</td>
                      <td className="p-2 text-center">
                        <div 
                          className="inline-block px-3 py-1 rounded text-white font-medium text-sm"
                          style={{ backgroundColor: getScoreColor(team.jan) }}
                        >
                          {team.jan}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div 
                          className="inline-block px-3 py-1 rounded text-white font-medium text-sm"
                          style={{ backgroundColor: getScoreColor(team.feb) }}
                        >
                          {team.feb}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div 
                          className="inline-block px-3 py-1 rounded text-white font-medium text-sm"
                          style={{ backgroundColor: getScoreColor(team.mar) }}
                        >
                          {team.mar}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div 
                          className="inline-block px-3 py-1 rounded text-white font-medium text-sm"
                          style={{ backgroundColor: getScoreColor(team.apr) }}
                        >
                          {team.apr}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div 
                          className="inline-block px-3 py-1 rounded text-white font-medium text-sm"
                          style={{ backgroundColor: getScoreColor(team.may) }}
                        >
                          {team.may}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div 
                          className="inline-block px-3 py-1 rounded text-white font-medium text-sm"
                          style={{ backgroundColor: getScoreColor(team.jun) }}
                        >
                          {team.jun}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span className="text-sm text-gray-600">High (7.5+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="text-sm text-gray-600">Medium (6.5-7.4)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm text-gray-600">Low (&lt;6.5)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CultureTrends; 