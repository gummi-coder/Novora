import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Filter,
  Flag,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Calendar,
  Users,
  Tag,
  Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  text: string;
  team: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: string;
  isFlagged: boolean;
  isReviewed: boolean;
  isAlert: boolean;
  keywords: string[];
  score: number;
}

interface FilterState {
  team: string;
  sentiment: string;
  keywords: string;
  alertOnly: boolean;
  searchQuery: string;
}

const AnonymousCommentsViewer = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');
  
  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    team: 'all',
    sentiment: 'all',
    keywords: '',
    alertOnly: false,
    searchQuery: ''
  });

  // Teams for filter
  const teams = [
    { id: 'all', name: 'All Teams' },
    { id: 'sales', name: 'Sales' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'hr', name: 'HR' }
  ];

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        
        // Mock comments data
        const mockComments: Comment[] = [
          {
            id: "1",
            text: "Great team collaboration this month! The new project management tools have really improved our workflow and communication. Everyone seems more engaged and productive.",
            team: "Engineering",
            sentiment: "positive",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isFlagged: false,
            isReviewed: false,
            isAlert: false,
            keywords: ["collaboration", "tools", "workflow"],
            score: 8.5
          },
          {
            id: "2",
            text: "Need more clarity on project priorities. Sometimes it feels like we're working on things that aren't the most important. Would appreciate better communication from leadership.",
            team: "Sales",
            sentiment: "negative",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            isFlagged: true,
            isReviewed: false,
            isAlert: true,
            keywords: ["priorities", "communication", "leadership"],
            score: 5.2
          },
          {
            id: "3",
            text: "Work-life balance has improved significantly. The flexible hours and remote work options are really appreciated.",
            team: "Marketing",
            sentiment: "positive",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            isFlagged: false,
            isReviewed: true,
            isAlert: false,
            keywords: ["work-life-balance", "flexible", "remote"],
            score: 8.8
          },
          {
            id: "4",
            text: "The office environment is okay, but could use some improvements. The coffee machine is always broken and the meeting rooms are too small for our team.",
            team: "HR",
            sentiment: "neutral",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            isFlagged: false,
            isReviewed: false,
            isAlert: false,
            keywords: ["office", "environment", "meetings"],
            score: 6.5
          },
          {
            id: "5",
            text: "Management doesn't listen to employee feedback. We've been asking for better training programs for months but nothing has changed.",
            team: "Sales",
            sentiment: "negative",
            timestamp: new Date(Date.now() - 18000000).toISOString(),
            isFlagged: true,
            isReviewed: false,
            isAlert: true,
            keywords: ["management", "feedback", "training"],
            score: 4.8
          },
          {
            id: "6",
            text: "The new benefits package is fantastic! The health insurance options and wellness programs are really comprehensive.",
            team: "Engineering",
            sentiment: "positive",
            timestamp: new Date(Date.now() - 21600000).toISOString(),
            isFlagged: false,
            isReviewed: false,
            isAlert: false,
            keywords: ["benefits", "health", "wellness"],
            score: 9.1
          }
        ];
        
        setComments(mockComments);
        setFilteredComments(mockComments);
        
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [toast]);

  // Filter comments based on current filters
  useEffect(() => {
    let filtered = comments;

    // Filter by team
    if (filters.team !== 'all') {
      filtered = filtered.filter(comment => 
        comment.team.toLowerCase() === filters.team
      );
    }

    // Filter by sentiment
    if (filters.sentiment !== 'all') {
      filtered = filtered.filter(comment => 
        comment.sentiment === filters.sentiment
      );
    }

    // Filter by keywords
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase().split(' ');
      filtered = filtered.filter(comment =>
        keywords.some(keyword =>
          comment.text.toLowerCase().includes(keyword) ||
          comment.keywords.some(k => k.toLowerCase().includes(keyword))
        )
      );
    }

    // Filter by alert only
    if (filters.alertOnly) {
      filtered = filtered.filter(comment => comment.isAlert);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(comment =>
        comment.text.toLowerCase().includes(query) ||
        comment.team.toLowerCase().includes(query) ||
        comment.keywords.some(k => k.toLowerCase().includes(query))
      );
    }

    // Filter by active tab
    if (activeTab === 'alerts') {
      filtered = filtered.filter(comment => comment.isAlert);
    }

    setFilteredComments(filtered);
  }, [comments, filters, activeTab]);

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const flagComment = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId 
        ? { ...comment, isFlagged: !comment.isFlagged }
        : comment
    ));
    
    toast({
      title: "Comment Flagged",
      description: "Comment has been flagged for review",
    });
  };

  const markAsReviewed = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId 
        ? { ...comment, isReviewed: !comment.isReviewed }
        : comment
    ));
    
    toast({
      title: "Comment Reviewed",
      description: "Comment has been marked as reviewed",
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const exportComments = () => {
    toast({
      title: "Export Started",
      description: "Comments are being exported to CSV",
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
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600 mt-1">Dive deep into anonymized comments to understand real context behind scores</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportComments}>
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
            {/* Team Filter */}
            <div className="space-y-2">
              <Label>Team</Label>
              <Select value={filters.team} onValueChange={(value) => setFilters(prev => ({ ...prev, team: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sentiment Filter */}
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Select value={filters.sentiment} onValueChange={(value) => setFilters(prev => ({ ...prev, sentiment: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Keywords Filter */}
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                placeholder="Enter keywords..."
                value={filters.keywords}
                onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>

            {/* Alert Only Filter */}
            <div className="space-y-2">
              <Label>Alert Only</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="alertOnly"
                  checked={filters.alertOnly}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, alertOnly: checked as boolean }))}
                />
                <Label htmlFor="alertOnly" className="text-sm">
                  Show only alert comments
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Box */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search comments, teams, or keywords..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>All Comments ({filteredComments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Highlight Alerts ({comments.filter(c => c.isAlert).length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <CommentList 
            comments={filteredComments}
            expandedComments={expandedComments}
            onToggleExpansion={toggleCommentExpansion}
            onFlagComment={flagComment}
            onMarkAsReviewed={markAsReviewed}
            getSentimentColor={getSentimentColor}
            formatTimestamp={formatTimestamp}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <CommentList 
            comments={filteredComments.filter(c => c.isAlert)}
            expandedComments={expandedComments}
            onToggleExpansion={toggleCommentExpansion}
            onFlagComment={flagComment}
            onMarkAsReviewed={markAsReviewed}
            getSentimentColor={getSentimentColor}
            formatTimestamp={formatTimestamp}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Comment List Component
interface CommentListProps {
  comments: Comment[];
  expandedComments: Set<string>;
  onToggleExpansion: (commentId: string) => void;
  onFlagComment: (commentId: string) => void;
  onMarkAsReviewed: (commentId: string) => void;
  getSentimentColor: (sentiment: string) => string;
  formatTimestamp: (timestamp: string) => string;
}

const CommentList = ({ 
  comments, 
  expandedComments, 
  onToggleExpansion, 
  onFlagComment, 
  onMarkAsReviewed,
  getSentimentColor,
  formatTimestamp
}: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
            <p>No comments found matching your filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className={`${comment.isAlert ? 'border-red-200 bg-red-50' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{comment.team}</span>
                </div>
                <Badge className={getSentimentColor(comment.sentiment)}>
                  {comment.sentiment}
                </Badge>
                {comment.isAlert && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Alert
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatTimestamp(comment.timestamp)}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className={`text-gray-700 ${expandedComments.has(comment.id) ? '' : 'line-clamp-2'}`}>
                {comment.text}
              </p>
              {comment.text.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpansion(comment.id)}
                  className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                >
                  {expandedComments.has(comment.id) ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Show more
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {comment.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={comment.isFlagged ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onFlagComment(comment.id)}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  {comment.isFlagged ? 'Flagged' : 'Flag'}
                </Button>
                <Button
                  variant={comment.isReviewed ? "default" : "outline"}
                  size="sm"
                  onClick={() => onMarkAsReviewed(comment.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {comment.isReviewed ? 'Reviewed' : 'Mark Reviewed'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnonymousCommentsViewer; 