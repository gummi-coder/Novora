import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

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
  const [team, setTeam] = useState<string>("all");
  const [sentiment, setSentiment] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [flaggedOnly, setFlaggedOnly] = useState<boolean>(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAnonymousComments({
          team: team === 'all' ? undefined : team,
          sentiment: sentiment === 'all' ? undefined : sentiment,
          search: search || undefined,
        });
        const mapped: CommentItem[] = data.map((d) => ({
          id: d.id,
          time: new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          team: d.team || '-',
          sentiment: (d.sentiment as Sentiment) || 'neutral',
          text: d.text,
          flagged: d.isFlagged,
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
                <div key={c.id} className="flex items-start justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
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
                    </div>
                    <div className="text-gray-900 leading-relaxed">{c.text}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                      Mark as read
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200">
                      Review
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


