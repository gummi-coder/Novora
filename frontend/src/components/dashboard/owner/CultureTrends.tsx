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
  EyeOff,
  BarChart3,
  Activity
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Culture Trends</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Visualize company culture over time with comprehensive analytics and insights
          </p>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Filters & View Options</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Customize your view and filter data by various criteria
                </CardDescription>
              </div>
              <Button onClick={handleExport} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date Range */}
              <div className="space-y-3">
                <Label className="font-semibold text-gray-900">Date Range</Label>
                <Select value={dateRange} onValueChange={onDateRangeChange}>
                  <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
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
              <div className="space-y-3">
                <Label className="font-semibold text-gray-900">View Mode</Label>
                <div className="flex items-center space-x-6 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={viewMode === 'department'}
                      onCheckedChange={() => handleViewModeChange('department')}
                    />
                    <Label className="font-medium">Department</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={viewMode === 'team'}
                      onCheckedChange={() => handleViewModeChange('team')}
                    />
                    <Label className="font-medium">Team</Label>
                  </div>
                </div>
              </div>

              {/* Question Type */}
              <div className="space-y-3">
                <Label className="font-semibold text-gray-900">Question Type</Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
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

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart: Average Score Over Time */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <span>Average Score Trend</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Organization-wide average score over time
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis domain={[6, 9]} stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(1), 'Score']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart: Teams with Alerts */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>Teams with Alerts</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Percentage of teams with alerts per month
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis domain={[0, 100]} stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Teams with Alerts']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey={(data) => getAlertPercentage(data.teamsWithAlerts, data.totalTeams)}
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Participation Rate Trend */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Participation Rate Trend</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Employee participation rate over time with engagement insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis domain={[60, 90]} stroke="#6b7280" />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Participation']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
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

        {/* Enhanced Heatmap Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-white" />
              </div>
              <span>Team Performance Heatmap</span>
            </h2>
            <p className="text-gray-600 mt-1">Monthly scores by team (color-coded performance indicators)</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="flex items-center space-x-2 hover:bg-gray-50 transition-all duration-200"
          >
            {showHeatmap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showHeatmap ? 'Hide' : 'Show'} Heatmap</span>
          </Button>
        </div>

        {/* Enhanced Heatmap */}
        {showHeatmap && (
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-gray-900">Team</th>
                      <th className="text-center p-3 font-semibold text-gray-900">Jan</th>
                      <th className="text-center p-3 font-semibold text-gray-900">Feb</th>
                      <th className="text-center p-3 font-semibold text-gray-900">Mar</th>
                      <th className="text-center p-3 font-semibold text-gray-900">Apr</th>
                      <th className="text-center p-3 font-semibold text-gray-900">May</th>
                      <th className="text-center p-3 font-semibold text-gray-900">Jun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((team, index) => (
                      <tr key={team.team} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="p-3 font-semibold text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-600">
                                {team.team.charAt(0)}
                              </span>
                            </div>
                            <span>{team.team}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div 
                            className="inline-block px-3 py-2 rounded-lg text-white font-semibold text-sm shadow-sm"
                            style={{ backgroundColor: getScoreColor(team.jan) }}
                          >
                            {team.jan}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div 
                            className="inline-block px-3 py-2 rounded-lg text-white font-semibold text-sm shadow-sm"
                            style={{ backgroundColor: getScoreColor(team.feb) }}
                          >
                            {team.feb}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div 
                            className="inline-block px-3 py-2 rounded-lg text-white font-semibold text-sm shadow-sm"
                            style={{ backgroundColor: getScoreColor(team.mar) }}
                          >
                            {team.mar}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div 
                            className="inline-block px-3 py-2 rounded-lg text-white font-semibold text-sm shadow-sm"
                            style={{ backgroundColor: getScoreColor(team.apr) }}
                          >
                            {team.apr}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div 
                            className="inline-block px-3 py-2 rounded-lg text-white font-semibold text-sm shadow-sm"
                            style={{ backgroundColor: getScoreColor(team.may) }}
                          >
                            {team.may}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div 
                            className="inline-block px-3 py-2 rounded-lg text-white font-semibold text-sm shadow-sm"
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
              
              {/* Enhanced Legend */}
              <div className="mt-6 flex items-center justify-center space-x-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="text-sm font-medium text-gray-700">High (7.5+)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="text-sm font-medium text-gray-700">Medium (6.5-7.4)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="text-sm font-medium text-gray-700">Low (&lt;6.5)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CultureTrends; 