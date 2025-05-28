import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Star,
  Users,
  Filter,
  Download,
  Tag,
  Mail,
  Ticket,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  PieChart,
  Cloud,
  Settings,
  MessageCircle,
  History,
  Bell,
  ExternalLink,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Feedback {
  id: string;
  type: "bug" | "feature" | "improvement" | "other";
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    plan: "free" | "pro" | "enterprise";
    lastActive: string;
  };
  status: "new" | "in_progress" | "resolved" | "declined";
  priority: "low" | "medium" | "high";
  createdAt: string;
  votes: number;
  sentiment: "positive" | "neutral" | "negative";
  channel: "in_app" | "email" | "social";
  tags: string[];
  assignedTo?: string;
  responseTime?: number;
  comments: {
    id: string;
    user: string;
    text: string;
    createdAt: string;
  }[];
  attachments?: {
    type: "image" | "log" | "other";
    url: string;
    name: string;
  }[];
}

interface FeedbackMetrics {
  total: number;
  new: number;
  resolved: number;
  averageResponseTime: number;
  sentimentScore: number;
  volumeByDay: { date: string; count: number }[];
  sentimentTrend: { date: string; positive: number; negative: number }[];
  topThemes: { theme: string; count: number }[];
}

const FeedbackPage = () => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [metrics, setMetrics] = useState<FeedbackMetrics>({
    total: 0,
    new: 0,
    resolved: 0,
    averageResponseTime: 0,
    sentimentScore: 0,
    volumeByDay: [],
    sentimentTrend: [],
    topThemes: [],
  });

  const [feedback] = useState<Feedback[]>([
    {
      id: "FB-001",
      type: "feature",
      title: "Add dark mode support",
      description: "Users have requested a dark mode option for better visibility in low-light conditions",
      user: {
        id: "john.doe@example.com",
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "https://avatars.githubusercontent.com/u/1?v=4",
        plan: "pro",
        lastActive: "2024-03-18T10:30:00",
      },
      status: "new",
      priority: "high",
      createdAt: "2024-03-18T10:30:00",
      votes: 42,
      sentiment: "positive",
      channel: "in_app",
      tags: ["dark mode", "visibility"],
      assignedTo: "jane.smith@example.com",
      responseTime: 24,
      comments: [],
      attachments: [],
    },
    {
      id: "FB-002",
      type: "bug",
      title: "Login page not responsive on mobile",
      description: "The login form breaks on mobile devices with screen width less than 320px",
      user: {
        id: "jane.smith@example.com",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatar: "https://avatars.githubusercontent.com/u/2?v=4",
        plan: "enterprise",
        lastActive: "2024-03-17T15:45:00",
      },
      status: "in_progress",
      priority: "high",
      createdAt: "2024-03-17T15:45:00",
      votes: 28,
      sentiment: "neutral",
      channel: "email",
      tags: ["login", "mobile"],
      assignedTo: "bob.johnson@example.com",
      responseTime: 48,
      comments: [],
      attachments: [],
    },
    {
      id: "FB-003",
      type: "improvement",
      title: "Enhance search functionality",
      description: "Add advanced filters and sorting options to the search feature",
      user: {
        id: "bob.johnson@example.com",
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        avatar: "https://avatars.githubusercontent.com/u/3?v=4",
        plan: "free",
        lastActive: "2024-03-16T09:15:00",
      },
      status: "new",
      priority: "medium",
      createdAt: "2024-03-16T09:15:00",
      votes: 15,
      sentiment: "negative",
      channel: "social",
      tags: ["search", "advanced filters"],
      assignedTo: "jane.smith@example.com",
      responseTime: 72,
      comments: [],
      attachments: [],
    },
  ]);

  const filteredFeedback = feedback.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    const matchesSentiment = sentimentFilter === "all" || item.sentiment === sentimentFilter;
    const matchesChannel = channelFilter === "all" || item.channel === channelFilter;
    const matchesSearch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesPriority && matchesSentiment && matchesChannel && matchesSearch;
  });

  const getStatusBadge = (status: Feedback["status"]) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">New</Badge>;
      case "in_progress":
        return <Badge variant="warning">In Progress</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
    }
  };

  const getPriorityBadge = (priority: Feedback["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "high":
        return <Badge variant="destructive">High</Badge>;
    }
  };

  const getTypeBadge = (type: Feedback["type"]) => {
    switch (type) {
      case "bug":
        return <Badge variant="destructive">Bug</Badge>;
      case "feature":
        return <Badge variant="success">Feature</Badge>;
      case "improvement":
        return <Badge variant="warning">Improvement</Badge>;
      case "other":
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">
          Manage user feedback and feature requests
        </p>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics.new} new this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sentimentScore}%</div>
            <p className="text-xs text-muted-foreground">
              Positive feedback
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((metrics.resolved / metrics.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Issues resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Feedback Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Volume over time chart will be displayed here
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Sentiment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Sentiment trend chart will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Themes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Top Feedback Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topThemes.map((theme, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{theme.theme}</span>
                  <span className="text-sm font-medium">{theme.count}</span>
                </div>
                <Progress value={(theme.count / metrics.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all_feedback">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto mb-8">
          <TabsTrigger value="all_feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            All Feedback
          </TabsTrigger>
          <TabsTrigger value="feature_requests" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Feature Requests
          </TabsTrigger>
          <TabsTrigger value="common_issues" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Common Issues
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Feedback Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feature_request">Feature Requests</SelectItem>
                <SelectItem value="bug_report">Bug Reports</SelectItem>
                <SelectItem value="praise">Praise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="in_app">In App</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all_feedback" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No feedback found matching your search criteria.
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "border rounded-md p-4 space-y-3 transition-colors",
                        selectedFeedback?.id === item.id && "bg-muted/50",
                        "hover:bg-muted/30 cursor-pointer"
                      )}
                      onClick={() => setSelectedFeedback(item)}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={item.user.avatar} />
                            <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.user.name}</p>
                            <p className="text-sm text-muted-foreground">{item.user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.user.plan}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Response
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Ticket className="mr-2 h-4 w-4" />
                                Create Ticket
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Tag className="mr-2 h-4 w-4" />
                                Add Tags
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getTypeBadge(item.type)}
                          </div>
                          <div className="text-sm text-muted-foreground">•</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">•</div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{item.votes}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">•</div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{item.responseTime}h</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                          {getPriorityBadge(item.priority)}
                        </div>
                      </div>
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Feedback View */}
        {selectedFeedback && (
          <div className="fixed inset-y-0 right-0 w-1/3 border-l bg-background p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Feedback Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFeedback(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">{selectedFeedback.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedFeedback.description}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>User Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={selectedFeedback.user.avatar} />
                        <AvatarFallback>{selectedFeedback.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedFeedback.user.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedFeedback.user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plan:</span>{" "}
                        <span className="font-medium">{selectedFeedback.user.plan}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Active:</span>{" "}
                        <span className="font-medium">
                          {new Date(selectedFeedback.user.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>Status & Priority</Label>
                  <div className="mt-2 flex gap-2">
                    {getStatusBadge(selectedFeedback.status)}
                    {getPriorityBadge(selectedFeedback.priority)}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>Comments</Label>
                  <div className="mt-2 space-y-4">
                    {selectedFeedback.comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{comment.user}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea placeholder="Add a comment..." />
                      <Button>Send</Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>Actions</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Response
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Ticket className="mr-2 h-4 w-4" />
                      Create Ticket
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Tag className="mr-2 h-4 w-4" />
                      Add Tags
                    </Button>
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <TabsContent value="feature_requests" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Feature Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {feedback
                  .sort((a, b) => b.votes - a.votes)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Star className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{item.votes}</span>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      <Progress value={(item.votes / 42) * 100} className="h-2" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="common_issues" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Common Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {feedback
                  .filter((f) => f.type === "bug")
                  .map((issue, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                            <ThumbsDown className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{issue.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          <span>{issue.votes}</span>
                        </div>
                      </div>
                      <Progress value={(issue.votes / 28) * 100} className="h-2" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Channels</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how users can submit feedback
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>In-App Widget</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to submit feedback directly from the application
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Surveys</Label>
                    <p className="text-sm text-muted-foreground">
                      Send feedback requests via email
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile SDK</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect feedback from mobile applications
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Routing</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set up rules for automatically handling feedback
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Negative Sentiment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Route to Support</SelectItem>
                      <SelectItem value="product">Route to Product Team</SelectItem>
                      <SelectItem value="urgent">Mark as Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Feature Requests</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Route to Product Team</SelectItem>
                      <SelectItem value="backlog">Add to Backlog</SelectItem>
                      <SelectItem value="review">Schedule Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bug Reports</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Route to Engineering</SelectItem>
                      <SelectItem value="qa">Route to QA Team</SelectItem>
                      <SelectItem value="urgent">Mark as Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect with other tools and services
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Jira</Label>
                    <p className="text-sm text-muted-foreground">
                      Create Jira tickets from feedback
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack channels
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Zendesk</Label>
                    <p className="text-sm text-muted-foreground">
                      Create Zendesk tickets from feedback
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Feedback Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Feedback</span>
                <span className="font-medium">{feedback.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Feature Requests</span>
                <span className="font-medium">
                  {feedback.filter(f => f.type === "feature").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bug Reports</span>
                <span className="font-medium">
                  {feedback.filter(f => f.type === "bug").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Positive Feedback</span>
                <span className="font-medium">
                  {feedback.filter(f => f.status === "resolved").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Positive</span>
                  <span className="text-sm font-medium">
                    {Math.round((feedback.filter(f => f.status === "resolved").length / feedback.length) * 100)}%
                  </span>
                </div>
                <div className="bg-muted h-2 rounded-full">
                  <div 
                    className="bg-success-500 h-2 rounded-full" 
                    style={{ width: `${(feedback.filter(f => f.status === "resolved").length / feedback.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Neutral</span>
                  <span className="text-sm font-medium">
                    {Math.round((feedback.filter(f => f.status === "in_progress").length / feedback.length) * 100)}%
                  </span>
                </div>
                <div className="bg-muted h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(feedback.filter(f => f.status === "in_progress").length / feedback.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Negative</span>
                  <span className="text-sm font-medium">
                    {Math.round((feedback.filter(f => f.status === "declined").length / feedback.length) * 100)}%
                  </span>
                </div>
                <div className="bg-muted h-2 rounded-full">
                  <div 
                    className="bg-destructive h-2 rounded-full" 
                    style={{ width: `${(feedback.filter(f => f.status === "declined").length / feedback.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    T
                  </div>
                  <div>
                    <p className="font-medium">TechCorp</p>
                    <p className="text-xs text-muted-foreground">24 feedback items</p>
                  </div>
                </div>
                <Badge variant="outline">Premium</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <p className="font-medium">Acme Inc.</p>
                    <p className="text-xs text-muted-foreground">18 feedback items</p>
                  </div>
                </div>
                <Badge variant="outline">Enterprise</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    G
                  </div>
                  <div>
                    <p className="font-medium">GlobalTech</p>
                    <p className="text-xs text-muted-foreground">12 feedback items</p>
                  </div>
                </div>
                <Badge variant="outline">Enterprise</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackPage;
