import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Filter, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  ArrowUpDown, 
  TrendingDown,
  Search,
  Flag,
  Download,
  Share,
  AlertTriangle,
  Users,
  Eye
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Sentiment = "positive" | "neutral" | "negative";
type TimeRange = "last-survey" | "last-3-months" | "custom";
type Metric = "all" | "recognition" | "job-satisfaction" | "manager-relationship" | "peer-collaboration" | "career-growth" | "value-alignment" | "communication" | "work-environment" | "health-wellness" | "engagement";
type SortOrder = "weakest-first" | "strongest-first" | "alphabetical";

interface CommentItem {
  id: string;
  time: string;
  team: string;
  sentiment: Sentiment;
  text: string;
  metric: Metric;
  flagged?: boolean;
  read?: boolean;
}

interface DriverData {
  metric: Metric;
  name: string;
  avgScore: number;
  change: number;
  detractors: number;
  passives: number;
  promoters: number;
  total: number;
}

const sentimentBadge = (s: Sentiment) => {
  switch (s) {
    case "positive": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "neutral": return "bg-blue-100 text-blue-700 border-blue-200";
    case "negative": return "bg-red-100 text-red-700 border-red-200";
  }
};

const Feedback = () => {
  const { toast } = useToast();
  
  // Filter states
  const [timeRange, setTimeRange] = useState<TimeRange>("last-survey");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<Metric>("all");
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("weakest-first");
  const [showBestQuestions, setShowBestQuestions] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available teams and metrics
  const teams = ["Engineering", "Sales", "Marketing", "Operations", "Product", "Design", "Customer Support"];
  const metrics = [
    { key: "recognition", name: "Recognition", description: "Employee recognition and appreciation" },
    { key: "job-satisfaction", name: "Job Satisfaction", description: "Overall job satisfaction levels" },
    { key: "manager-relationship", name: "Manager Relationship", description: "Relationship with direct manager" },
    { key: "peer-collaboration", name: "Peer Collaboration", description: "Team collaboration and peer relationships" },
    { key: "career-growth", name: "Career Growth", description: "Career development opportunities" },
    { key: "value-alignment", name: "Value Alignment", description: "Alignment with company values" },
    { key: "communication", name: "Communication", description: "Internal communication effectiveness" },
    { key: "work-environment", name: "Work Environment", description: "Physical and cultural work environment" },
    { key: "health-wellness", name: "Health & Wellness", description: "Health and wellness programs" },
    { key: "engagement", name: "Engagement", description: "Overall employee engagement" }
  ];

  // Mock data
  const mockComments: CommentItem[] = [
    {
      id: "1",
      time: "Jul 15",
      team: "Engineering",
      sentiment: "positive",
      metric: "job-satisfaction",
      text: "The new development workflow has significantly improved our productivity. Code reviews are more efficient and the CI/CD pipeline is working great!",
      flagged: false,
      read: true
    },
    {
      id: "2",
      time: "Jul 14",
      team: "Sales",
      sentiment: "negative",
      metric: "recognition",
      text: "I've been hitting my targets consistently for 6 months but haven't received any recognition. It's demotivating to see others get praised for similar achievements.",
      flagged: true,
      read: false
    },
    {
      id: "3",
      time: "Jul 14",
      team: "Marketing",
      sentiment: "positive",
      metric: "value-alignment",
      text: "Love the new brand guidelines and design system! The consistency across all our materials has improved dramatically.",
      flagged: false,
      read: true
    },
    {
      id: "4",
      time: "Jul 13",
      team: "Operations",
      sentiment: "neutral",
      metric: "work-environment",
      text: "The new inventory management system is working as expected. Some minor bugs here and there, but overall it's functional. Would appreciate more training sessions for the team.",
      flagged: false,
      read: false
    },
    {
      id: "5",
      time: "Jul 13",
      team: "Engineering",
      sentiment: "negative",
      metric: "manager-relationship",
      text: "The code review process has become too bureaucratic. We're spending more time on process than actual development. Need to streamline this ASAP.",
      flagged: true,
      read: false
    },
    {
      id: "6",
      time: "Jul 12",
      team: "Sales",
      sentiment: "positive",
      metric: "career-growth",
      text: "The new sales training program is excellent! Our conversion rates have improved by 25% since implementation. The role-playing exercises are particularly helpful.",
      flagged: false,
      read: true
    },
    {
      id: "7",
      time: "Jul 12",
      team: "Marketing",
      sentiment: "neutral",
      metric: "engagement",
      text: "The social media campaign is performing average. Engagement is okay but not exceptional. We might need to adjust our content strategy for better results.",
      flagged: false,
      read: false
    },
    {
      id: "8",
      time: "Jul 11",
      team: "Operations",
      sentiment: "negative",
      metric: "work-environment",
      text: "The new scheduling system is a disaster. It's constantly double-booking appointments and the interface is confusing. This is causing customer complaints daily.",
      flagged: true,
      read: false
    },
    {
      id: "9",
      time: "Jul 11",
      team: "Engineering",
      sentiment: "positive",
      metric: "job-satisfaction",
      text: "The new testing framework is fantastic! Our bug reports have decreased by 40% and deployment confidence is much higher. Great investment in quality.",
      flagged: false,
      read: true
    },
    {
      id: "10",
      time: "Jul 10",
      team: "Sales",
      sentiment: "neutral",
      metric: "peer-collaboration",
      text: "The lead generation system is working fine, but we could use more qualified leads. The current conversion rate is acceptable but there's room for improvement.",
      flagged: false,
      read: false
    },
    {
      id: "11",
      time: "Jul 10",
      team: "Marketing",
      sentiment: "positive",
      metric: "communication",
      text: "The new content management system is a game-changer! Publishing is so much faster and the analytics are incredibly detailed. This has transformed our workflow.",
      flagged: false,
      read: true
    },
    {
      id: "12",
      time: "Jul 9",
      team: "Operations",
      sentiment: "negative",
      metric: "health-wellness",
      text: "The customer support ticketing system is completely broken. Tickets are getting lost, responses are delayed, and customers are extremely frustrated. This needs immediate attention.",
      flagged: true,
      read: false
    },
    {
      id: "13",
      time: "Jul 9",
      team: "Engineering",
      sentiment: "positive",
      metric: "peer-collaboration",
      text: "The new agile methodology implementation is working great! Sprint planning is more efficient and team velocity has improved significantly. Great leadership decision.",
      flagged: false,
      read: false
    },
    {
      id: "14",
      time: "Jul 8",
      team: "Sales",
      sentiment: "neutral",
      metric: "recognition",
      text: "The new commission structure is fair but complex. It takes time to understand all the variables. Maybe we need a simpler explanation or calculator tool.",
      flagged: false,
      read: true
    },
    {
      id: "15",
      time: "Jul 8",
      team: "Marketing",
      sentiment: "positive",
      metric: "value-alignment",
      text: "The new analytics dashboard is incredible! Real-time data visualization has helped us make much better campaign decisions. ROI tracking is now crystal clear.",
      flagged: false,
      read: false
    }
  ];

  const mockDriverData: DriverData[] = [
    { metric: "job-satisfaction", name: "Job Satisfaction", avgScore: 7.8, change: 0.3, detractors: 15, passives: 25, promoters: 60, total: 100 },
    { metric: "recognition", name: "Recognition", avgScore: 7.2, change: -0.2, detractors: 20, passives: 30, promoters: 50, total: 100 },
    { metric: "manager-relationship", name: "Manager Relationship", avgScore: 8.1, change: 0.5, detractors: 10, passives: 20, promoters: 70, total: 100 },
    { metric: "peer-collaboration", name: "Peer Collaboration", avgScore: 8.3, change: 0.4, detractors: 8, passives: 18, promoters: 74, total: 100 },
    { metric: "career-growth", name: "Career Growth", avgScore: 6.9, change: -0.1, detractors: 25, passives: 35, promoters: 40, total: 100 },
    { metric: "value-alignment", name: "Value Alignment", avgScore: 7.6, change: 0.2, detractors: 12, passives: 28, promoters: 60, total: 100 },
    { metric: "communication", name: "Communication", avgScore: 7.1, change: -0.3, detractors: 18, passives: 32, promoters: 50, total: 100 },
    { metric: "work-environment", name: "Work Environment", avgScore: 7.9, change: 0.6, detractors: 10, passives: 22, promoters: 68, total: 100 },
    { metric: "health-wellness", name: "Health & Wellness", avgScore: 7.4, change: 0.1, detractors: 15, passives: 30, promoters: 55, total: 100 },
    { metric: "engagement", name: "Engagement", avgScore: 7.7, change: 0.4, detractors: 12, passives: 25, promoters: 63, total: 100 }
  ];

  const bestQuestions = [
    { id: "bq1", text: "I feel valued and recognized for my contributions at work", category: "Recognition", score: 8.7, responseRate: 94, positivePercentage: 85, change: 0.3 },
    { id: "bq2", text: "My team collaborates effectively and supports each other", category: "Team Collaboration", score: 8.5, responseRate: 92, positivePercentage: 82, change: 0.5 },
    { id: "bq3", text: "I have a good work-life balance", category: "Work-Life Balance", score: 8.3, responseRate: 89, positivePercentage: 78, change: 0.4 },
    { id: "bq4", text: "My manager provides clear direction and feedback", category: "Manager Relationship", score: 8.2, responseRate: 91, positivePercentage: 80, change: 0.6 },
    { id: "bq5", text: "I feel proud to work for this company", category: "Value Alignment", score: 8.1, responseRate: 88, positivePercentage: 77, change: 0.2 }
  ];

  const worstQuestions = [
    { id: "wq1", text: "I have clear career growth opportunities", category: "Career Growth", score: 6.2, responseRate: 88, positivePercentage: 45, change: -0.8 },
    { id: "wq2", text: "Communication from leadership is clear and timely", category: "Communication", score: 6.8, responseRate: 90, positivePercentage: 52, change: -0.3 },
    { id: "wq3", text: "I receive adequate training for my role", category: "Career Growth", score: 6.5, responseRate: 87, positivePercentage: 48, change: -0.5 },
    { id: "wq4", text: "My workload is manageable", category: "Work Environment", score: 6.9, responseRate: 92, positivePercentage: 55, change: -0.2 },
    { id: "wq5", text: "I feel heard when I raise concerns", category: "Communication", score: 6.7, responseRate: 89, positivePercentage: 50, change: -0.4 }
  ];

  // Filtered data
  const filtered = useMemo(() => {
    let filtered = mockComments;
    
    if (selectedTeam !== "all") {
      filtered = filtered.filter(comment => comment.team === selectedTeam);
    }
    
    if (selectedMetric !== "all") {
      filtered = filtered.filter(comment => comment.metric === selectedMetric);
    }
    
    if (selectedSentiment !== "all") {
      filtered = filtered.filter(comment => comment.sentiment === selectedSentiment);
    }
    
    if (flaggedOnly) {
      filtered = filtered.filter(comment => comment.flagged);
    }
    
    if (search) {
      filtered = filtered.filter(comment => 
        comment.text.toLowerCase().includes(search.toLowerCase()) ||
        comment.team.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered;
  }, [mockComments, selectedTeam, selectedMetric, selectedSentiment, flaggedOnly, search]);

  const filteredDriverData = useMemo(() => {
    let filtered = mockDriverData;
    
    switch (sortOrder) {
      case "weakest-first":
        return [...filtered].sort((a, b) => a.avgScore - b.avgScore);
      case "strongest-first":
        return [...filtered].sort((a, b) => b.avgScore - a.avgScore);
      case "alphabetical":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return filtered;
    }
  }, [mockDriverData, sortOrder]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your feedback data is being prepared for download.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Link Generated",
      description: "A shareable link has been copied to your clipboard.",
    });
  };

  const handleMarkAsRead = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, read: true } : comment
    ));
    toast({
      title: "Marked as Read",
      description: "Comment has been marked as read",
    });
  };

  const handleFlagComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, flagged: !comment.flagged } : comment
    ));
    toast({
      title: "Flag Updated",
      description: "Comment flag status has been updated",
    });
  };

  return (
    <div className="space-y-6 p-6">

      {/* Driver Performance Distribution */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 mb-1 text-xl font-bold text-gray-900">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                </div>
                Driver Performance
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Click on any driver to filter comments
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <div className="w-2 h-2 bg-red-500 rounded"></div>
                <span>0-6</span>
                <div className="w-2 h-2 bg-yellow-500 rounded ml-2"></div>
                <span>7-8</span>
                <div className="w-2 h-2 bg-green-500 rounded ml-2"></div>
                <span>9-10</span>
              </div>
              <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                <SelectTrigger className="w-32 h-8 text-xs border-gray-200 bg-white/50 backdrop-blur-sm">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weakest-first">Weakest First</SelectItem>
                  <SelectItem value="strongest-first">Strongest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDriverData.map((driver) => (
              <div 
                key={driver.metric}
                className="group cursor-pointer hover:bg-gray-50 rounded-lg p-3 transition-all duration-200 border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                    {driver.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-gray-900">
                      {driver.avgScore.toFixed(1)}
                    </span>
                    <span className={`text-xs font-medium ${driver.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {driver.change > 0 ? '+' : ''}{driver.change.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div 
                    className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${driver.detractors}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 h-full bg-yellow-500 transition-all duration-300"
                    style={{ 
                      left: `${driver.detractors}%`,
                      width: `${driver.passives}%`
                    }}
                  ></div>
                  <div 
                    className="absolute top-0 h-full bg-green-500 transition-all duration-300"
                    style={{ 
                      left: `${driver.detractors + driver.passives}%`,
                      width: `${driver.promoters}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{driver.detractors}%</span>
                  <span>{driver.passives}%</span>
                  <span>{driver.promoters}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Sentiment Card */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">68%</div>
              <div className="text-lg font-semibold text-green-600 mb-1">Overall Sentiment</div>
              <div className="text-sm text-green-600 flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12% vs last month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution Card */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Sentiment Distribution</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Negative</span>
                </div>
              </div>
            </div>
            <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: '68%' }}></div>
              <div className="absolute top-0 h-full bg-yellow-500" style={{ left: '68%', width: '22%' }}></div>
              <div className="absolute top-0 h-full bg-red-500" style={{ left: '90%', width: '10%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>68% Positive</span>
              <span>22% Neutral</span>
              <span>10% Negative</span>
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis Card */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Trend</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Positive</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600">68%</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs ml-1">+12%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Neutral</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-yellow-600">22%</span>
                    <div className="flex items-center text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs ml-1">-8%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Negative</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-600">10%</span>
                    <div className="flex items-center text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs ml-1">-4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Themes & Keywords Section */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-gray-700" />
                </div>
                Themes & Keywords
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Most-mentioned topics with sentiment breakdown and trend analysis
              </CardDescription>
            </div>
            <Select defaultValue="3-months">
              <SelectTrigger className="w-48 border-gray-200 bg-white/50 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-months">Last 3 Months</SelectItem>
                <SelectItem value="6-months">Last 6 Months</SelectItem>
                <SelectItem value="12-months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Workload Theme */}
            <div className="p-6 border border-gray-200/50 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Workload</h3>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+40%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mentions:</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Positive:</span>
                  <span className="text-green-600 font-semibold">45%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Negative:</span>
                  <span className="text-red-600 font-semibold">55%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Rising topic</span>
                  <span>High priority</span>
                </div>
              </div>
            </div>

            {/* Recognition Theme */}
            <div className="p-6 border border-gray-200/50 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Recognition</h3>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+25%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mentions:</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Positive:</span>
                  <span className="text-green-600 font-semibold">80%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Negative:</span>
                  <span className="text-red-600 font-semibold">20%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Positive trend</span>
                  <span>Keep momentum</span>
                </div>
              </div>
            </div>

            {/* Communication Theme */}
            <div className="p-6 border border-gray-200/50 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Communication</h3>
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">-15%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mentions:</span>
                  <span className="font-semibold">134</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Positive:</span>
                  <span className="text-green-600 font-semibold">35%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Negative:</span>
                  <span className="text-red-600 font-semibold">65%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Declining topic</span>
                  <span>Needs attention</span>
                </div>
              </div>
            </div>

            {/* Career Growth Theme */}
            <div className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Career Growth</h3>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+18%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mentions:</span>
                  <span className="font-semibold">67</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Positive:</span>
                  <span className="text-green-600 font-semibold">60%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Negative:</span>
                  <span className="text-red-600 font-semibold">40%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Growing interest</span>
                  <span>Monitor closely</span>
                </div>
              </div>
            </div>

            {/* Work-Life Balance Theme */}
            <div className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Work-Life Balance</h3>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="text-sm font-medium">→</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mentions:</span>
                  <span className="font-semibold">45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Positive:</span>
                  <span className="text-green-600 font-semibold">70%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Negative:</span>
                  <span className="text-red-600 font-semibold">30%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Stable topic</span>
                  <span>Good performance</span>
                </div>
              </div>
            </div>

            {/* Team Collaboration Theme */}
            <div className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+32%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mentions:</span>
                  <span className="font-semibold">112</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Positive:</span>
                  <span className="text-green-600 font-semibold">75%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Negative:</span>
                  <span className="text-red-600 font-semibold">25%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Strong positive</span>
                  <span>Success story</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Topics This Month */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 mb-2 text-xl font-bold text-gray-900">
              <div className="p-2 bg-gray-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
              Hot Topics This Month
            </CardTitle>
            <CardDescription className="text-gray-600">
              Trending topics with significant mention increases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Workload</h4>
                    <p className="text-sm text-gray-600">156 mentions this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">+40%</div>
                  <div className="text-xs text-gray-500">vs last month</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Communication</h4>
                    <p className="text-sm text-gray-600">134 mentions this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">+28%</div>
                  <div className="text-xs text-gray-500">vs last month</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Career Growth</h4>
                    <p className="text-sm text-gray-600">67 mentions this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">+18%</div>
                  <div className="text-xs text-gray-500">vs last month</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Team Collaboration</h4>
                    <p className="text-sm text-gray-600">112 mentions this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">+32%</div>
                  <div className="text-xs text-gray-500">vs last month</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positive Highlights */}
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 mb-2 text-xl font-bold text-gray-900">
              <div className="p-2 bg-gray-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
              Positive Highlights
            </CardTitle>
            <CardDescription className="text-gray-600">
              Areas with exceptional positive sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Recognition</h4>
                    <p className="text-sm text-gray-600">89 total mentions</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">80%</div>
                  <div className="text-xs text-gray-500">positive</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Team Collaboration</h4>
                    <p className="text-sm text-gray-600">112 total mentions</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">75%</div>
                  <div className="text-xs text-gray-500">positive</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Work-Life Balance</h4>
                    <p className="text-sm text-gray-600">45 total mentions</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">70%</div>
                  <div className="text-xs text-gray-500">positive</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Career Growth</h4>
                    <p className="text-sm text-gray-600">67 total mentions</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">60%</div>
                  <div className="text-xs text-gray-500">positive</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <h4 className="font-semibold text-blue-900 mb-1">Success Story</h4>
                  <p className="text-sm text-blue-700">
                    Recognition program shows 80% positive sentiment, indicating strong employee appreciation for acknowledgment efforts.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Performance Analysis */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-gray-700" />
                </div>
                Question Performance Analysis
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Top 5 best and worst performing survey questions
              </CardDescription>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowBestQuestions(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  showBestQuestions
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Best Performing
              </button>
              <button
                onClick={() => setShowBestQuestions(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !showBestQuestions
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Worst Performing
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {(showBestQuestions ? bestQuestions : worstQuestions).map((question, index) => (
              <div key={question.id} className="p-6 border border-gray-200/50 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{question.text}</h3>
                      <p className="text-sm text-gray-600">{question.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      showBestQuestions ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {question.score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">Total Score</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span className="font-medium">0</span>
                    <span className="font-medium">1</span>
                    <span className="font-medium">2</span>
                    <span className="font-medium">3</span>
                    <span className="font-medium">4</span>
                    <span className="font-medium">5</span>
                    <span className="font-medium">6</span>
                    <span className="font-medium">7</span>
                    <span className="font-medium">8</span>
                    <span className="font-medium">9</span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out shadow-sm ${
                        showBestQuestions 
                          ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-600' 
                          : 'bg-gradient-to-r from-red-400 via-red-500 to-pink-600'
                      }`}
                      style={{ width: `${(question.score / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{question.responseRate}%</div>
                    <div className="text-gray-500">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{question.positivePercentage}%</div>
                    <div className="text-gray-500">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{question.change > 0 ? '+' : ''}{question.change.toFixed(1)}</div>
                    <div className="text-gray-500">vs Last Month</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Analytics */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <MessageSquare className="w-6 h-6 text-gray-700" />
                Feedback Analytics
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Comprehensive employee feedback analysis and insights
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
                    <SelectItem value="last-survey">Last Survey</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
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
                    {teams.map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">+12%</Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
                  <p className="text-sm text-gray-600">Total Comments</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">+8%</Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {filtered.filter(c => c.sentiment === "positive").length}
                  </p>
                  <p className="text-sm text-gray-600">Positive</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">-3%</Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {filtered.filter(c => c.flagged).length}
                  </p>
                  <p className="text-sm text-gray-600">Flagged</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">+5%</Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(filtered.map(c => c.team)).size}
                  </p>
                  <p className="text-sm text-gray-600">Teams</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search comments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-gray-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
              <Button
                variant={flaggedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFlaggedOnly(!flaggedOnly)}
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Flagged Only
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Comments */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Comments
          </CardTitle>
          <CardDescription>Latest employee feedback and suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((comment) => (
              <div key={comment.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={sentimentBadge(comment.sentiment)}>
                      {comment.sentiment}
                    </Badge>
                    <span className="text-sm text-gray-600">{comment.team}</span>
                    <span className="text-sm text-gray-500">{comment.time}</span>
                    {comment.flagged && (
                      <Badge variant="destructive" className="text-xs">
                        <Flag className="w-3 h-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!comment.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(comment.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFlagComment(comment.id)}
                      className={comment.flagged ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-gray-700"}
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{comment.text}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Metric: {metrics.find(m => m.key === comment.metric)?.name}</span>
                  <span>{comment.read ? 'Read' : 'Unread'}</span>
                </div>
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No comments match your current filters</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
