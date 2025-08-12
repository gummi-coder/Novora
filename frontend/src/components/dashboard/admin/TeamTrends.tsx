import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import DriverMetricsMatrix from "@/components/dashboard/admin/DriverMetricsMatrix";
import { useToast } from "@/hooks/use-toast";

type Metric = "score" | "participation" | "alerts";

interface TrendPoint {
  month: string;
  Sales: number;
  Marketing: number;
  Engineering: number;
  Product: number;
  HR: number;
  Finance: number;
  Operations: number;
  Design: number;
}

const TeamTrends = () => {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("Last 3 Months");
  const [metric, setMetric] = useState<Metric>("score");

  // Data for different date ranges
  const allData = useMemo(() => ({
    "Last 3 Months": {
      lineData: [
        { month: "May", Sales: 6.4, Marketing: 7.1, Engineering: 7.8, Product: 6.9, HR: 7.3, Finance: 6.2, Operations: 6.7, Design: 7.5 },
        { month: "Jun", Sales: 6.1, Marketing: 7.4, Engineering: 7.6, Product: 7.2, HR: 7.1, Finance: 6.5, Operations: 6.9, Design: 7.3 },
        { month: "Jul", Sales: 6.6, Marketing: 7.5, Engineering: 7.9, Product: 7.4, HR: 7.6, Finance: 6.8, Operations: 7.1, Design: 7.7 },
      ],
      participationData: [
        { month: "May", Sales: 72, Marketing: 78, Engineering: 85, Product: 76, HR: 81, Finance: 68, Operations: 74, Design: 79 },
        { month: "Jun", Sales: 75, Marketing: 80, Engineering: 83, Product: 78, HR: 79, Finance: 71, Operations: 77, Design: 81 },
        { month: "Jul", Sales: 82, Marketing: 84, Engineering: 87, Product: 81, HR: 83, Finance: 75, Operations: 80, Design: 84 },
      ],
      responsesData: [
        { month: "May", Sales: 120, Marketing: 95, Engineering: 156, Product: 108, HR: 89, Finance: 67, Operations: 92, Design: 103 },
        { month: "Jun", Sales: 98, Marketing: 88, Engineering: 142, Product: 112, HR: 85, Finance: 73, Operations: 96, Design: 97 },
        { month: "Jul", Sales: 140, Marketing: 110, Engineering: 168, Product: 125, HR: 98, Finance: 82, Operations: 108, Design: 115 },
      ],
    },
    "This Quarter": {
      lineData: [
        { month: "Apr", Sales: 6.2, Marketing: 6.8, Engineering: 7.5, Product: 6.7, HR: 7.0, Finance: 6.0, Operations: 6.5, Design: 7.2 },
        { month: "May", Sales: 6.4, Marketing: 7.1, Engineering: 7.8, Product: 6.9, HR: 7.3, Finance: 6.2, Operations: 6.7, Design: 7.5 },
        { month: "Jun", Sales: 6.1, Marketing: 7.4, Engineering: 7.6, Product: 7.2, HR: 7.1, Finance: 6.5, Operations: 6.9, Design: 7.3 },
      ],
      participationData: [
        { month: "Apr", Sales: 68, Marketing: 75, Engineering: 82, Product: 73, HR: 78, Finance: 65, Operations: 71, Design: 76 },
        { month: "May", Sales: 72, Marketing: 78, Engineering: 85, Product: 76, HR: 81, Finance: 68, Operations: 74, Design: 79 },
        { month: "Jun", Sales: 75, Marketing: 80, Engineering: 83, Product: 78, HR: 79, Finance: 71, Operations: 77, Design: 81 },
      ],
      responsesData: [
        { month: "Apr", Sales: 105, Marketing: 82, Engineering: 145, Product: 95, HR: 78, Finance: 58, Operations: 85, Design: 92 },
        { month: "May", Sales: 120, Marketing: 95, Engineering: 156, Product: 108, HR: 89, Finance: 67, Operations: 92, Design: 103 },
        { month: "Jun", Sales: 98, Marketing: 88, Engineering: 142, Product: 112, HR: 85, Finance: 73, Operations: 96, Design: 97 },
      ],
    },
    "This Year": {
      lineData: [
        { month: "Jan", Sales: 5.8, Marketing: 6.5, Engineering: 7.2, Product: 6.3, HR: 6.8, Finance: 5.7, Operations: 6.1, Design: 6.9 },
        { month: "Feb", Sales: 6.0, Marketing: 6.7, Engineering: 7.4, Product: 6.5, HR: 7.0, Finance: 5.9, Operations: 6.3, Design: 7.1 },
        { month: "Mar", Sales: 6.1, Marketing: 6.9, Engineering: 7.6, Product: 6.7, HR: 7.1, Finance: 6.0, Operations: 6.4, Design: 7.2 },
        { month: "Apr", Sales: 6.2, Marketing: 6.8, Engineering: 7.5, Product: 6.7, HR: 7.0, Finance: 6.0, Operations: 6.5, Design: 7.2 },
        { month: "May", Sales: 6.4, Marketing: 7.1, Engineering: 7.8, Product: 6.9, HR: 7.3, Finance: 6.2, Operations: 6.7, Design: 7.5 },
        { month: "Jun", Sales: 6.1, Marketing: 7.4, Engineering: 7.6, Product: 7.2, HR: 7.1, Finance: 6.5, Operations: 6.9, Design: 7.3 },
        { month: "Jul", Sales: 6.6, Marketing: 7.5, Engineering: 7.9, Product: 7.4, HR: 7.6, Finance: 6.8, Operations: 7.1, Design: 7.7 },
      ],
      participationData: [
        { month: "Jan", Sales: 65, Marketing: 72, Engineering: 79, Product: 70, HR: 75, Finance: 62, Operations: 68, Design: 73 },
        { month: "Feb", Sales: 67, Marketing: 74, Engineering: 81, Product: 72, HR: 77, Finance: 64, Operations: 70, Design: 75 },
        { month: "Mar", Sales: 69, Marketing: 76, Engineering: 83, Product: 74, HR: 79, Finance: 66, Operations: 72, Design: 77 },
        { month: "Apr", Sales: 68, Marketing: 75, Engineering: 82, Product: 73, HR: 78, Finance: 65, Operations: 71, Design: 76 },
        { month: "May", Sales: 72, Marketing: 78, Engineering: 85, Product: 76, HR: 81, Finance: 68, Operations: 74, Design: 79 },
        { month: "Jun", Sales: 75, Marketing: 80, Engineering: 83, Product: 78, HR: 79, Finance: 71, Operations: 77, Design: 81 },
        { month: "Jul", Sales: 82, Marketing: 84, Engineering: 87, Product: 81, HR: 83, Finance: 75, Operations: 80, Design: 84 },
      ],
      responsesData: [
        { month: "Jan", Sales: 95, Marketing: 75, Engineering: 135, Product: 85, HR: 68, Finance: 52, Operations: 78, Design: 88 },
        { month: "Feb", Sales: 102, Marketing: 78, Engineering: 142, Product: 90, HR: 72, Finance: 55, Operations: 82, Design: 90 },
        { month: "Mar", Sales: 108, Marketing: 82, Engineering: 148, Product: 95, HR: 75, Finance: 58, Operations: 86, Design: 93 },
        { month: "Apr", Sales: 105, Marketing: 82, Engineering: 145, Product: 95, HR: 78, Finance: 58, Operations: 85, Design: 92 },
        { month: "May", Sales: 120, Marketing: 95, Engineering: 156, Product: 108, HR: 89, Finance: 67, Operations: 92, Design: 103 },
        { month: "Jun", Sales: 98, Marketing: 88, Engineering: 142, Product: 112, HR: 85, Finance: 73, Operations: 96, Design: 97 },
        { month: "Jul", Sales: 140, Marketing: 110, Engineering: 168, Product: 125, HR: 98, Finance: 82, Operations: 108, Design: 115 },
      ],
    },
    "Last 6 Months": {
      lineData: [
        { month: "Feb", Sales: 6.0, Marketing: 6.7, Engineering: 7.4, Product: 6.5, HR: 7.0, Finance: 5.9, Operations: 6.3, Design: 7.1 },
        { month: "Mar", Sales: 6.1, Marketing: 6.9, Engineering: 7.6, Product: 6.7, HR: 7.1, Finance: 6.0, Operations: 6.4, Design: 7.2 },
        { month: "Apr", Sales: 6.2, Marketing: 6.8, Engineering: 7.5, Product: 6.7, HR: 7.0, Finance: 6.0, Operations: 6.5, Design: 7.2 },
        { month: "May", Sales: 6.4, Marketing: 7.1, Engineering: 7.8, Product: 6.9, HR: 7.3, Finance: 6.2, Operations: 6.7, Design: 7.5 },
        { month: "Jun", Sales: 6.1, Marketing: 7.4, Engineering: 7.6, Product: 7.2, HR: 7.1, Finance: 6.5, Operations: 6.9, Design: 7.3 },
        { month: "Jul", Sales: 6.6, Marketing: 7.5, Engineering: 7.9, Product: 7.4, HR: 7.6, Finance: 6.8, Operations: 7.1, Design: 7.7 },
      ],
      participationData: [
        { month: "Feb", Sales: 67, Marketing: 74, Engineering: 81, Product: 72, HR: 77, Finance: 64, Operations: 70, Design: 75 },
        { month: "Mar", Sales: 69, Marketing: 76, Engineering: 83, Product: 74, HR: 79, Finance: 66, Operations: 72, Design: 77 },
        { month: "Apr", Sales: 68, Marketing: 75, Engineering: 82, Product: 73, HR: 78, Finance: 65, Operations: 71, Design: 76 },
        { month: "May", Sales: 72, Marketing: 78, Engineering: 85, Product: 76, HR: 81, Finance: 68, Operations: 74, Design: 79 },
        { month: "Jun", Sales: 75, Marketing: 80, Engineering: 83, Product: 78, HR: 79, Finance: 71, Operations: 77, Design: 81 },
        { month: "Jul", Sales: 82, Marketing: 84, Engineering: 87, Product: 81, HR: 83, Finance: 75, Operations: 80, Design: 84 },
      ],
      responsesData: [
        { month: "Feb", Sales: 102, Marketing: 78, Engineering: 142, Product: 90, HR: 72, Finance: 55, Operations: 82, Design: 90 },
        { month: "Mar", Sales: 108, Marketing: 82, Engineering: 148, Product: 95, HR: 75, Finance: 58, Operations: 86, Design: 93 },
        { month: "Apr", Sales: 105, Marketing: 82, Engineering: 145, Product: 95, HR: 78, Finance: 58, Operations: 85, Design: 92 },
        { month: "May", Sales: 120, Marketing: 95, Engineering: 156, Product: 108, HR: 89, Finance: 67, Operations: 92, Design: 103 },
        { month: "Jun", Sales: 98, Marketing: 88, Engineering: 142, Product: 112, HR: 85, Finance: 73, Operations: 96, Design: 97 },
        { month: "Jul", Sales: 140, Marketing: 110, Engineering: 168, Product: 125, HR: 98, Finance: 82, Operations: 108, Design: 115 },
      ],
    },
  }), []);

  // Get current data based on selected date range
  const currentData = allData[dateRange as keyof typeof allData] || allData["Last 3 Months"];
  
  const lineData = useMemo<TrendPoint[]>(() => currentData.lineData, [currentData.lineData]);
  const participationData = useMemo(() => currentData.participationData, [currentData.participationData]);
  const responsesData = useMemo(() => currentData.responsesData, [currentData.responsesData]);

  const activeSeries = metric === "score" ? lineData : participationData;

  // Show toast when date range changes
  useEffect(() => {
    if (dateRange !== "Last 3 Months") { // Don't show on initial load
      toast({
        title: "Date Range Updated",
        description: `Showing data for ${dateRange.toLowerCase()}`,
      });
    }
  }, [dateRange, toast]);

  const colorForTeam = (team: string) => {
    const colors = {
      Sales: "#2563eb",
      Marketing: "#16a34a", 
      Engineering: "#dc2626",
      Product: "#7c3aed",
      HR: "#ea580c",
      Finance: "#0891b2",
      Operations: "#059669",
      Design: "#be185d"
    };
    return colors[team as keyof typeof colors] || "#6b7280";
  };

  // Matrix props
  const teams = useMemo(() => ([
    { id: "Sales", name: "Sales" },
    { id: "Marketing", name: "Marketing" },
    { id: "Engineering", name: "Engineering" },
    { id: "Product", name: "Product" },
    { id: "HR", name: "HR" },
    { id: "Finance", name: "Finance" },
    { id: "Operations", name: "Operations" },
    { id: "Design", name: "Design" },
  ]), []);

  const drivers = useMemo(() => ([
    { id: "participation", name: "Participation" },
    { id: "happiness", name: "Happiness/Satisfaction" },
    { id: "enps", name: "eNPS/Engagement" },
    { id: "value_alignment", name: "Value Alignment" },
    { id: "communication", name: "Communication" },
    { id: "career_growth", name: "Career & Growth" },
    { id: "manager_relationship", name: "Manager Relationship" },
    { id: "peer_collaboration", name: "Peer Collaboration" },
    { id: "recognition", name: "Recognition" },
    { id: "well_being", name: "Well-being" },
    { id: "environment", name: "Environment" },
  ]), []);

  // Build sample scores using latest month values for two primary drivers and placeholders for others
  const latestIdx = lineData.length - 1;
  const latestPartIdx = participationData.length - 1;
  const scores = useMemo(() => {
    const base: any[] = [];
    
    // Get the latest data from the current date range
    const latestLineData = lineData[lineData.length - 1];
    const latestParticipationData = participationData[participationData.length - 1];
    const latestResponsesData = responsesData[responsesData.length - 1];
    
    // Generate realistic scores for all teams and drivers based on current data
    const teamScores = {
      Sales: { 
        base: latestLineData?.Sales || 6.6, 
        participation: latestParticipationData?.Sales || 82, 
        responses: latestResponsesData?.Sales || 140 
      },
      Marketing: { 
        base: latestLineData?.Marketing || 7.5, 
        participation: latestParticipationData?.Marketing || 84, 
        responses: latestResponsesData?.Marketing || 110 
      },
      Engineering: { 
        base: latestLineData?.Engineering || 7.9, 
        participation: latestParticipationData?.Engineering || 87, 
        responses: latestResponsesData?.Engineering || 168 
      },
      Product: { 
        base: latestLineData?.Product || 7.4, 
        participation: latestParticipationData?.Product || 81, 
        responses: latestResponsesData?.Product || 125 
      },
      HR: { 
        base: latestLineData?.HR || 7.6, 
        participation: latestParticipationData?.HR || 83, 
        responses: latestResponsesData?.HR || 98 
      },
      Finance: { 
        base: latestLineData?.Finance || 6.8, 
        participation: latestParticipationData?.Finance || 75, 
        responses: latestResponsesData?.Finance || 82 
      },
      Operations: { 
        base: latestLineData?.Operations || 7.1, 
        participation: latestParticipationData?.Operations || 80, 
        responses: latestResponsesData?.Operations || 108 
      },
      Design: { 
        base: latestLineData?.Design || 7.7, 
        participation: latestParticipationData?.Design || 84, 
        responses: latestResponsesData?.Design || 115 
      },
    };

    // Driver-specific variations and realistic deltas
    const driverVariations = {
      participation: { variation: 0, isPercentage: true },
      happiness: { variation: 0.2, isPercentage: false },
      enps: { variation: 0.4, isPercentage: false },
      value_alignment: { variation: 0.3, isPercentage: false },
      communication: { variation: 0.5, isPercentage: false },
      career_growth: { variation: 0.6, isPercentage: false },
      manager_relationship: { variation: 0.4, isPercentage: false },
      peer_collaboration: { variation: 0.3, isPercentage: false },
      recognition: { variation: 0.7, isPercentage: false },
      well_being: { variation: 0.2, isPercentage: false },
      environment: { variation: 0.1, isPercentage: false },
    };

    for (const team of teams) {
      const teamData = teamScores[team.id as keyof typeof teamScores];
      for (const driver of drivers) {
        const driverData = driverVariations[driver.id as keyof typeof driverVariations];
        let score: number;
        let delta: number;
        
        if (driver.id === "participation") {
          score = teamData.participation / 10; // Convert percentage to 0-10 scale
          delta = Math.random() * 4 - 2; // -2 to +2 percentage points
        } else {
          const baseScore = teamData.base;
          const variation = (Math.random() - 0.5) * 2 * driverData.variation;
          score = Math.max(0, Math.min(10, baseScore + variation));
          delta = (Math.random() - 0.5) * 2; // -1 to +1 points
        }
        
        base.push({
          teamId: team.id,
          driverId: driver.id,
          score: Math.round(score * 10) / 10, // Round to 1 decimal
          delta: Math.round(delta * 10) / 10, // Round to 1 decimal
          responses: teamData.responses,
        });
      }
    }

    return base;
  }, [drivers, lineData, participationData, teams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Trends</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track team engagement, sentiment and participation over time with detailed analytics
          </p>
        </div>

        {/* Enhanced Filters Card */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </div>
                  <span>Filters</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Adjust the view to analyze performance across different teams and timeframes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                    <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                    <SelectItem value="This Quarter">This Quarter</SelectItem>
                    <SelectItem value="This Year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Metric</Label>
                <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="alerts">Alert Frequency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Performance Chart */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span>Performance Over Time</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Line chart showing {metric} trends across selected teams for {dateRange.toLowerCase()} ({lineData.length} data points)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {(selectedTeam === "all" || selectedTeam === "Sales") && (
                    <Line type="monotone" dataKey="Sales" stroke={colorForTeam("Sales")} strokeWidth={3} dot={{ fill: colorForTeam("Sales"), strokeWidth: 2, r: 4 }} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Marketing") && (
                    <Line type="monotone" dataKey="Marketing" stroke={colorForTeam("Marketing")} strokeWidth={3} dot={{ fill: colorForTeam("Marketing"), strokeWidth: 2, r: 4 }} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Engineering") && (
                    <Line type="monotone" dataKey="Engineering" stroke={colorForTeam("Engineering")} strokeWidth={3} dot={{ fill: colorForTeam("Engineering"), strokeWidth: 2, r: 4 }} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Product") && (
                    <Line type="monotone" dataKey="Product" stroke={colorForTeam("Product")} strokeWidth={3} dot={{ fill: colorForTeam("Product"), strokeWidth: 2, r: 4 }} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "HR") && (
                    <Line type="monotone" dataKey="HR" stroke={colorForTeam("HR")} strokeWidth={3} dot={{ fill: colorForTeam("HR"), strokeWidth: 2, r: 4 }} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Finance") && (
                    <Line type="monotone" dataKey="Finance" stroke={colorForTeam("Finance")} strokeWidth={3} dot={{ fill: colorForTeam("Finance"), strokeWidth: 2, r: 4 }} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Operations") && (
                    <Line type="monotone" dataKey="Operations" stroke={colorForTeam("Operations")} strokeWidth={3} dot={{ fill: colorForTeam("Operations"), strokeWidth: 2, r: 4 }} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Design") && (
                    <Line type="monotone" dataKey="Design" stroke={colorForTeam("Design")} strokeWidth={3} dot={{ fill: colorForTeam("Design"), strokeWidth: 2, r: 4 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Survey Responses Chart */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span>Survey Responses Over Time</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Number of responses collected from each team over time for {dateRange.toLowerCase()} ({responsesData.length} data points)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responsesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  {(selectedTeam === "all" || selectedTeam === "Sales") && (
                    <Bar dataKey="Sales" fill={colorForTeam("Sales")} radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Marketing") && (
                    <Bar dataKey="Marketing" fill={colorForTeam("Marketing")} radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Engineering") && (
                    <Bar dataKey="Engineering" fill={colorForTeam("Engineering")} radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Product") && (
                    <Bar dataKey="Product" fill={colorForTeam("Product")} radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "HR") && (
                    <Bar dataKey="HR" fill={colorForTeam("HR")} radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Finance") && (
                    <Bar dataKey="Finance" fill={colorForTeam("Finance")} radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Operations") && (
                    <Bar dataKey="Operations" fill={colorForTeam("Operations")} radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedTeam === "all" || selectedTeam === "Design") && (
                    <Bar dataKey="Design" fill={colorForTeam("Design")} radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Separator className="my-6" />
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Use the filters above to focus on a specific team and timeframe for detailed analysis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Driver Metrics Matrix */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <span>Driver Metrics Matrix</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Heatmap of cultural driver scores by team - click cells for detailed insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DriverMetricsMatrix
              teams={teams}
              drivers={drivers}
              scores={scores}
              onCellClick={(teamId, driverId) => console.log('cell', { teamId, driverId })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamTrends;


