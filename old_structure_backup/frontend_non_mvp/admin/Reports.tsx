import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  FileText,
  BarChart3,
  Link as LinkIcon,
  CheckCircle,
  Copy,
  ExternalLink,
  Users,
  TrendingUp,
  TrendingDown,
  MessageSquare
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";

const Reports: React.FC = () => {
  const [shareLink, setShareLink] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("6m");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [driverFilter, setDriverFilter] = useState<string>("all");
  const [compareA, setCompareA] = useState<string>("2024-08");
  const [compareB, setCompareB] = useState<string>("2024-05");
  const { toast } = useToast();

  // Mock digest metrics
  const digest = {
    avgScore: 7.8,
    avgScoreDelta: +0.3,
    enps: 35,
    promoters: 62,
    passives: 23,
    detractors: 15,
    participation: 87,
    sentiment: { positive: 64, neutral: 26, negative: 10 }
  };

  // Mock series for line chart
  const history = useMemo(
    () => [
      { name: 'Mar', avgScore: 7.0, participation: 78 },
      { name: 'Apr', avgScore: 7.3, participation: 81 },
      { name: 'May', avgScore: 7.6, participation: 85 },
      { name: 'Jun', avgScore: 7.2, participation: 79 },
      { name: 'Jul', avgScore: 7.5, participation: 82 },
      { name: 'Aug', avgScore: 7.8, participation: 87 }
    ],
    []
  );

  // Mock team comparison
  const teamScores = [
    { team: 'Engineering', score: 7.9 },
    { team: 'Sales', score: 7.2 },
    { team: 'Marketing', score: 7.6 },
    { team: 'HR', score: 8.1 },
    { team: 'Finance', score: 7.4 },
    { team: 'Operations', score: 7.7 }
  ];

  // Mock drivers
  const drivers = [
    { driver: 'Communication', score: 7.1 },
    { driver: 'Leadership', score: 7.9 },
    { driver: 'Tools', score: 6.8 },
    { driver: 'Processes', score: 7.0 },
    { driver: 'Recognition', score: 7.6 }
  ];

  // Mock periods for comparison
  const periods = [
    { id: '2024-08', label: 'Aug 2024' },
    { id: '2024-07', label: 'Jul 2024' },
    { id: '2024-06', label: 'Jun 2024' },
    { id: '2024-05', label: 'May 2024' }
  ];

  const getTrendIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const generateLink = () => {
    const link = `https://novorasurveys.com/reports/shared/${Math.random().toString(36).slice(2, 8)}`;
    setShareLink(link);
    toast({ title: "Link Generated", description: "Share link has been created successfully!" });
  };

  const copyToClipboard = async () => {
    if (!shareLink) {
      toast({ title: "No Link Available", description: "Please generate a link first.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({ title: "Link Copied", description: "Share link has been copied to clipboard!" });
    } catch {
      toast({ title: "Copy Failed", description: "Failed to copy link to clipboard.", variant: "destructive" });
    }
  };

  const exportPDF = () => {
    toast({ title: "Exporting PDF", description: "Generating Monthly Digest..." });
    setTimeout(() => {
      const blob = new Blob(["Mock PDF content for Monthly Digest"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `novora-monthly-digest-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF Exported", description: "Monthly Digest downloaded." });
    }, 1200);
  };

  const exportCSV = () => {
    toast({ title: "Exporting CSV", description: "Generating Trend Report..." });
    setTimeout(() => {
      const csvContent = `Date,Team,AvgScore,Participation\nMar,All,7.0,78%\nApr,All,7.3,81%\nMay,All,7.6,85%\nJun,All,7.2,79%\nJul,All,7.5,82%\nAug,All,7.8,87%`;
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `novora-trend-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "CSV Exported", description: "Trend Report downloaded." });
    }, 1000);
  };

  const exportComparisonPDF = () => {
    toast({ title: "Exporting Comparison", description: "Generating Before/After report..." });
    setTimeout(() => {
      const blob = new Blob(["Mock PDF content for Comparison"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `novora-comparison-${compareA}-vs-${compareB}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Comparison Exported", description: "Before/After report downloaded." });
    }, 1100);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Reports Management Board */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <FileText className="w-6 h-6 text-gray-700" />
                Reports Management
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Executive-ready digests, trends, comparisons, and shareable outputs
              </CardDescription>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-gray-200 bg-white/50 backdrop-blur-sm"
                onClick={generateLink}
              >
                <LinkIcon className="w-4 h-4 mr-2" /> Share Link
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={exportPDF}
              >
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Avg Score */}
              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    {getTrendIcon(digest.avgScoreDelta)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{digest.avgScore.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg Score</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {digest.avgScoreDelta > 0 ? "+" : ""}{digest.avgScoreDelta.toFixed(1)} vs last month
                    </p>
                  </div>
                </div>
              </div>

              {/* eNPS */}
              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{digest.enps}</p>
                    <p className="text-sm text-gray-600">eNPS</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Promoters {digest.promoters}% • Passives {digest.passives}% • Detractors {digest.detractors}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Participation */}
              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{digest.participation}%</p>
                    <p className="text-sm text-gray-600">Participation</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Organization-wide
                    </p>
                  </div>
                </div>
              </div>

              {/* Sentiment */}
              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{digest.sentiment.positive}%</p>
                    <p className="text-sm text-gray-600">Sentiment</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {digest.sentiment.positive}% positive
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Reports */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                  <BarChart3 className="w-6 h-6 text-gray-700" />
                  Trend Reports
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Avg Score and Participation trends, team comparison, and drivers
                </CardDescription>
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="h-10 w-28 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="h-10 w-40 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger className="h-10 w-44 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue placeholder="All drivers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="company" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="company">Company Trends</TabsTrigger>
                <TabsTrigger value="teams">Team Comparison</TabsTrigger>
                <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="mt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={2} name="Avg Score" />
                      <Line yAxisId="right" type="monotone" dataKey="participation" stroke="#10B981" strokeWidth={2} name="Participation %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="teams" className="mt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamScores}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="team" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#6366F1" name="Avg Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="drivers" className="mt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drivers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="driver" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#22C55E" name="Driver Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Before / After Comparison */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                  <BarChart3 className="w-6 h-6 text-gray-700" />
                  Before / After Comparison
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Select two periods to compare
                </CardDescription>
              </div>
              
              {/* Period Selectors */}
              <div className="flex items-center gap-2">
                <Select value={compareA} onValueChange={setCompareA}>
                  <SelectTrigger className="h-10 w-36 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(p => (<SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500">vs</div>
                <Select value={compareB} onValueChange={setCompareB}>
                  <SelectTrigger className="h-10 w-36 border-gray-200 bg-white/50 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(p => (<SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={exportComparisonPDF}
                  className="border-gray-200 bg-white/50 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Comparison
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[{ label: 'Period A', key: compareA }, { label: 'Period B', key: compareB }].map(section => (
                <div key={section.key} className="border rounded-xl p-4 bg-white">
                  <div className="text-sm text-gray-600 mb-3">{section.label}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Avg Score</div>
                      <div className="text-2xl font-bold">{section.label === 'Period A' ? '7.5' : '7.8'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">eNPS</div>
                      <div className="text-2xl font-bold">{section.label === 'Period A' ? '30' : '35'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Participation</div>
                      <div className="text-2xl font-bold">{section.label === 'Period A' ? '82%' : '87%'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sentiment Positive</div>
                      <div className="text-2xl font-bold">{section.label === 'Period A' ? '60%' : '64%'}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Top 3 Drivers Improved</div>
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        <li>Leadership</li>
                        <li>Recognition</li>
                        <li>Communication</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Top 3 Drivers Declined</div>
                      <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                        <li>Tools</li>
                        <li>Processes</li>
                        <li>Workload</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export & Share Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">This Month's Results (PDF)</CardTitle>
                  <CardDescription className="mt-1">Export summary report</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={exportPDF} className="w-full bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Trend Report (CSV)</CardTitle>
                  <CardDescription className="mt-1">Month-over-month metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={exportCSV} className="w-full bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Shareable Link</CardTitle>
                  <CardDescription className="mt-1">Read-only view for stakeholders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-3">
                <Input value={shareLink} readOnly placeholder="No link generated yet" className="h-12 border-gray-200 bg-white/50 backdrop-blur-sm" />
                <Button onClick={generateLink} className="bg-blue-600 hover:bg-blue-700">
                  <LinkIcon className="w-4 h-4 mr-2" /> Generate
                </Button>
                {shareLink && (
                  <Button onClick={copyToClipboard} variant="outline" className="border-gray-200 bg-white/50 backdrop-blur-sm">
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                )}
              </div>
              {shareLink && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" /> Link generated successfully.
                </div>
              )}
            </CardContent>
          </Card>

        {/* Benchmarks (Preview) */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                  <BarChart3 className="w-6 h-6 text-gray-700" />
                  Benchmarks (Preview)
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Compare against internal and industry averages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-xl bg-white">
                <div className="text-sm text-gray-600 mb-1">Your eNPS</div>
                <div className="text-2xl font-bold">35</div>
              </div>
              <div className="p-4 border rounded-xl bg-white">
                <div className="text-sm text-gray-600 mb-1">Internal Avg (All Teams)</div>
                <div className="text-2xl font-bold">31</div>
              </div>
              <div className="p-4 border rounded-xl bg-white">
                <div className="text-sm text-gray-600 mb-1">Industry Benchmark (SMB)</div>
                <div className="text-2xl font-bold">28</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Library */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                  <FileText className="w-6 h-6 text-gray-700" />
                  Report Library
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  All generated exports and comparisons
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border border-gray-200 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Period Covered</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Date Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Monthly Digest", period: "Aug 2024", format: "PDF", date: "2024-08-07" },
                    { name: "Trend Report", period: "Mar–Aug 2024", format: "CSV", date: "2024-08-07" },
                    { name: "Before/After Comparison", period: "Aug vs May 2024", format: "PDF", date: "2024-08-08" }
                  ].map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.period}</TableCell>
                      <TableCell>{r.format}</TableCell>
                      <TableCell>{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={exportPDF} className="border-gray-200 bg-white/50 backdrop-blur-sm">
                            <Download className="w-4 h-4 mr-1" /> Re-download
                          </Button>
                          <Button variant="outline" size="sm" onClick={generateLink} className="border-gray-200 bg-white/50 backdrop-blur-sm">
                            <LinkIcon className="w-4 h-4 mr-1" /> Share
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;


