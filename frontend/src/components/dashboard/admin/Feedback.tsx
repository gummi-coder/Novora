import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Sentiment = "positive" | "neutral" | "negative";

interface CommentItem {
  id: string;
  time: string;
  team: string;
  sentiment: Sentiment;
  text: string;
  flagged?: boolean;
  read?: boolean;
}

const sentimentBadge = (s: Sentiment) => {
  switch (s) {
    case "positive": return "bg-green-100 text-green-700";
    case "neutral": return "bg-blue-100 text-blue-700";
    case "negative": return "bg-red-100 text-red-700";
  }
};

const Feedback = () => {
  const { toast } = useToast();
  const [team, setTeam] = useState<string>("all");
  const [sentiment, setSentiment] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for feedback comments
  const mockComments: CommentItem[] = [
    {
      id: "1",
      time: "Jul 15",
      team: "Engineering",
      sentiment: "positive",
      text: "The new development workflow has significantly improved our productivity. The CI/CD pipeline is much faster and the code review process is streamlined. Great work by the DevOps team!",
      flagged: false,
      read: false
    },
    {
      id: "2",
      time: "Jul 14",
      team: "Sales",
      sentiment: "negative",
      text: "The new CRM system is causing major issues. It's slow, crashes frequently, and the customer data keeps getting corrupted. This is affecting our ability to close deals effectively.",
      flagged: true,
      read: false
    },
    {
      id: "3",
      time: "Jul 14",
      team: "Marketing",
      sentiment: "positive",
      text: "Love the new brand guidelines and design system! The consistency across all our materials has improved dramatically. The marketing team feels more confident in our creative output.",
      flagged: false,
      read: true
    },
    {
      id: "4",
      time: "Jul 13",
      team: "Operations",
      sentiment: "neutral",
      text: "The new inventory management system is working as expected. Some minor bugs here and there, but overall it's functional. Would appreciate more training sessions for the team.",
      flagged: false,
      read: false
    },
    {
      id: "5",
      time: "Jul 13",
      team: "Engineering",
      sentiment: "negative",
      text: "The code review process has become too bureaucratic. We're spending more time on process than actual development. Need to streamline this ASAP.",
      flagged: true,
      read: false
    },
    {
      id: "6",
      time: "Jul 12",
      team: "Sales",
      sentiment: "positive",
      text: "The new sales training program is excellent! Our conversion rates have improved by 25% since implementation. The role-playing exercises are particularly helpful.",
      flagged: false,
      read: true
    },
    {
      id: "7",
      time: "Jul 12",
      team: "Marketing",
      sentiment: "neutral",
      text: "The social media campaign is performing average. Engagement is okay but not exceptional. We might need to adjust our content strategy for better results.",
      flagged: false,
      read: false
    },
    {
      id: "8",
      time: "Jul 11",
      team: "Operations",
      sentiment: "negative",
      text: "The new scheduling system is a disaster. It's constantly double-booking appointments and the interface is confusing. This is causing customer complaints daily.",
      flagged: true,
      read: false
    },
    {
      id: "9",
      time: "Jul 11",
      team: "Engineering",
      sentiment: "positive",
      text: "The new testing framework is fantastic! Our bug reports have decreased by 40% and deployment confidence is much higher. Great investment in quality.",
      flagged: false,
      read: true
    },
    {
      id: "10",
      time: "Jul 10",
      team: "Sales",
      sentiment: "neutral",
      text: "The lead generation system is working fine, but we could use more qualified leads. The current conversion rate is acceptable but there's room for improvement.",
      flagged: false,
      read: false
    },
    {
      id: "11",
      time: "Jul 10",
      team: "Marketing",
      sentiment: "positive",
      text: "The new content management system is a game-changer! Publishing is so much faster and the analytics are incredibly detailed. This has transformed our workflow.",
      flagged: false,
      read: true
    },
    {
      id: "12",
      time: "Jul 9",
      team: "Operations",
      sentiment: "negative",
      text: "The customer support ticketing system is completely broken. Tickets are getting lost, responses are delayed, and customers are extremely frustrated. This needs immediate attention.",
      flagged: true,
      read: false
    },
    {
      id: "13",
      time: "Jul 9",
      team: "Engineering",
      sentiment: "positive",
      text: "The new agile methodology implementation is working great! Sprint planning is more efficient and team velocity has improved significantly. Great leadership decision.",
      flagged: false,
      read: false
    },
    {
      id: "14",
      time: "Jul 8",
      team: "Sales",
      sentiment: "neutral",
      text: "The new commission structure is fair but complex. It takes time to understand all the variables. Maybe we need a simpler explanation or calculator tool.",
      flagged: false,
      read: true
    },
    {
      id: "15",
      time: "Jul 8",
      team: "Marketing",
      sentiment: "positive",
      text: "The new analytics dashboard is incredible! Real-time data visualization has helped us make much better campaign decisions. ROI tracking is now crystal clear.",
      flagged: false,
      read: false
    }
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use mock data instead of API call
        const data = mockComments;
        const mapped: CommentItem[] = data.map((d) => ({
          id: d.id,
          time: d.time,
          team: d.team,
          sentiment: d.sentiment,
          text: d.text,
          flagged: d.flagged,
          read: d.read
        }));
        setComments(mapped);
      } catch (e) {
        setError('Failed to load comments');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [team, sentiment, search]);

  const filtered = comments.filter((c) => {
    if (team !== "all" && c.team !== team) return false;
    if (sentiment !== "all" && c.sentiment !== sentiment) return false;
    if (flaggedOnly && !c.flagged) return false;
    if (search && !c.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Interactive functions
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read and analyze anonymous employee comments to understand team sentiment and concerns
          </p>
        </div>

        {/* Feedback Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Comments</p>
                  <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Positive</p>
                  <p className="text-2xl font-bold text-green-600">
                    {comments.filter(c => c.sentiment === 'positive').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Flagged</p>
                  <p className="text-2xl font-bold text-red-600">
                    {comments.filter(c => c.flagged).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {comments.filter(c => !c.read).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM10 7h10V5H10v2zM10 11h10V9H10v2zM10 15h10v-2H10v2zM10 19h10v-2H10v2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  Refine the comment feed to focus on specific teams, sentiments, or keywords
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Team</Label>
                <Select value={team} onValueChange={setTeam}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Ops">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Sentiment</Label>
                <Select value={sentiment} onValueChange={setSentiment}>
                  <SelectTrigger className="h-12">
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
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Keyword Search</Label>
                <Input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search comments..." 
                  className="h-12" 
                />
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  id="flagged" 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                  checked={flaggedOnly} 
                  onChange={(e) => setFlaggedOnly(e.target.checked)} 
                />
                <Label htmlFor="flagged" className="text-sm font-medium text-gray-700">Flagged only</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Comment Feed */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span>Comment Feed</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Anonymous employee feedback - newest comments first
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {filtered.length} comment{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading comments...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {filtered.map((c) => (
                <div key={c.id} className={`flex items-start justify-between p-6 border rounded-lg transition-colors duration-200 ${
                  c.read ? 'border-gray-100 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-500 font-medium">{c.time}</div>
                      <div className="text-gray-400">•</div>
                      <div className="text-sm text-gray-600 font-medium">{c.team}</div>
                      <Badge className={`${sentimentBadge(c.sentiment)} px-2 py-1 text-xs font-medium`}>
                        {c.sentiment}
                      </Badge>
                      {c.flagged && (
                        <Badge variant="destructive" className="px-2 py-1 text-xs font-medium">
                          Flagged
                        </Badge>
                      )}
                      {c.read && (
                        <Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
                          Read
                        </Badge>
                      )}
                    </div>
                    <div className={`leading-relaxed ${c.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {c.text}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!c.read && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-blue-50 hover:border-blue-200"
                        onClick={() => handleMarkAsRead(c.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`hover:bg-red-50 hover:border-red-200 ${c.flagged ? 'bg-red-50 border-red-200' : ''}`}
                      onClick={() => handleFlagComment(c.id)}
                    >
                      {c.flagged ? 'Unflag' : 'Flag'}
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No comments match your filters</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;


