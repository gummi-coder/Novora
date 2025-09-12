import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  Share2, 
  Download, 
  Plus, 
  Clock, 
  Users, 
  Calendar as CalendarIcon,
  Copy,
  Check,
  Settings,
  BarChart3,
  Send,
  Edit3,
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  MessageSquare, 
  Flag,
  Eye,
  Filter,
  Bell,
  XCircle,
  Minus,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SurveyActivity, ScoreThreshold, CommentTags } from "./types";

const SurveyActivityLog = () => {
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<SurveyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreThreshold, setScoreThreshold] = useState<ScoreThreshold>({
    enabled: true,
    value: 1.5,
    action: 'flag'
  });
  const [commentTags, setCommentTags] = useState<CommentTags>({
    well_being: true,
    leadership: true,
    culture: true,
    compensation: false,
    work_life_balance: true,
    career_growth: false,
    communication: true,
    other: []
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filterFlags, setFilterFlags] = useState<string[]>([]);

  useEffect(() => {
    const fetchSurveyActivity = async () => {
      try {
        setLoading(true);
        const response = await api.getSurveyActivityLog();
        setSurveys(response);
      } catch (error) {
        console.error('Error fetching survey activity:', error);
        toast({
          title: "Error",
          description: "Failed to load survey activity data",
          variant: "destructive"
        });
        // Fallback to mock data
        setSurveys([
          {
            id: "1",
            title: "Q1 Employee Satisfaction Survey",
            sentDate: "2024-01-15T10:00:00Z",
            responseCount: 45,
            expectedResponses: 60,
            completionRate: 75,
            avgScore: 7.2,
            scoreDelta: -1.8,
            flags: [
              {
                type: 'score_drop',
                severity: 'high',
                message: 'Score dropped by 1.8 points (threshold: 1.5)',
                createdAt: '2024-01-16T14:30:00Z'
              },
              {
                type: 'low_completion',
                severity: 'medium',
                message: 'Completion rate below 80% (75%)',
                createdAt: '2024-01-16T12:15:00Z'
              }
            ],
            urgentComments: [
              {
                id: "1",
                text: "Work-life balance has deteriorated significantly. Management needs to address this immediately.",
                tags: ['work_life_balance', 'leadership'],
                flagged: true,
                createdAt: '2024-01-16T09:45:00Z'
              },
              {
                id: "2",
                text: "Mental health support is lacking. We need better resources.",
                tags: ['well_being'],
                flagged: true,
                createdAt: '2024-01-16T10:20:00Z'
              }
            ],
            status: 'active'
          },
          {
            id: "2",
            title: "Team Collaboration Assessment",
            sentDate: "2024-01-10T14:00:00Z",
            responseCount: 0,
            expectedResponses: 25,
            completionRate: 0,
            avgScore: 0,
            scoreDelta: 0,
            flags: [
              {
                type: 'zero_responses',
                severity: 'high',
                message: 'No responses received after 5 days',
                createdAt: '2024-01-15T16:00:00Z'
              }
            ],
            urgentComments: [],
            status: 'active'
          },
          {
            id: "3",
            title: "Leadership Feedback Survey",
            sentDate: "2024-01-08T09:00:00Z",
            responseCount: 38,
            expectedResponses: 40,
            completionRate: 95,
            avgScore: 8.1,
            scoreDelta: 0.3,
            flags: [],
            urgentComments: [
              {
                id: "3",
                text: "Great communication from leadership team!",
                tags: ['leadership', 'communication'],
                flagged: false,
                createdAt: '2024-01-09T11:30:00Z'
              }
            ],
            status: 'completed'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyActivity();
  }, [toast]);

  const getFlagIcon = (type: string) => {
    switch (type) {
      case 'zero_responses': return <XCircle className="h-4 w-4" />;
      case 'score_drop': return <TrendingDown className="h-4 w-4" />;
      case 'urgent_comment': return <MessageSquare className="h-4 w-4" />;
      case 'low_completion': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getFlagColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-600';
    if (delta < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getScoreDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (delta < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTagColor = (tag: string) => {
    const colors = {
      well_being: 'bg-purple-100 text-purple-800',
      leadership: 'bg-blue-100 text-blue-800',
      culture: 'bg-green-100 text-green-800',
      compensation: 'bg-orange-100 text-orange-800',
      work_life_balance: 'bg-pink-100 text-pink-800',
      career_growth: 'bg-indigo-100 text-indigo-800',
      communication: 'bg-teal-100 text-teal-800'
    };
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateThreshold = async () => {
    try {
      await api.updateScoreThreshold(scoreThreshold);
      toast({
        title: "Settings Updated",
        description: "Score threshold settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update score threshold settings",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCommentTags = async () => {
    try {
      await api.updateCommentTags(commentTags);
      toast({
        title: "Settings Updated",
        description: "Comment tag settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment tag settings",
        variant: "destructive"
      });
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    if (filterFlags.length === 0) return true;
    return survey.flags.some(flag => filterFlags.includes(flag.type));
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Survey Activity Log</CardTitle>
          <CardDescription>Monitor survey performance and detect issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Survey Activity Log</h2>
          <p className="text-gray-600">Monitor survey performance and detect issues early</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter Flags
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Settings</CardTitle>
            <CardDescription>Configure score thresholds and comment flagging</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Threshold */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="score-threshold">Score Delta Threshold</Label>
                <Switch
                  id="score-threshold"
                  checked={scoreThreshold.enabled}
                  onCheckedChange={(checked) => setScoreThreshold(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
              {scoreThreshold.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="threshold-value">Threshold Value</Label>
                    <Input
                      id="threshold-value"
                      type="number"
                      step="0.1"
                      value={scoreThreshold.value}
                      onChange={(e) => setScoreThreshold(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold-action">Action</Label>
                    <select
                      id="threshold-action"
                      value={scoreThreshold.action}
                      onChange={(e) => setScoreThreshold(prev => ({ ...prev, action: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="flag">Flag</option>
                      <option value="alert">Alert</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              )}
              <Button onClick={handleUpdateThreshold} size="sm">
                Update Threshold
              </Button>
            </div>

            {/* Comment Tags */}
            <div className="space-y-4">
              <Label>Auto-flag Comments with Tags</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(commentTags).map(([key, value]) => {
                  if (key === 'other') return null;
                  return (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => setCommentTags(prev => ({ ...prev, [key]: checked }))}
                      />
                      <Label className="text-sm capitalize">{key.replace('_', ' ')}</Label>
                    </div>
                  );
                })}
              </div>
              <Button onClick={handleUpdateCommentTags} size="sm">
                Update Tags
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Survey Activity List */}
      <div className="space-y-4">
        {filteredSurveys.map((survey) => (
          <Card key={survey.id} className={cn(
            "transition-all",
            survey.flags.length > 0 && "border-l-4 border-l-red-500"
          )}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2">
                    <span>{survey.title}</span>
                    <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                      {survey.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Sent {formatDate(survey.sentDate)} • {survey.responseCount}/{survey.expectedResponses} responses ({survey.completionRate}%)
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {getScoreDeltaIcon(survey.scoreDelta)}
                      <span className={cn("font-medium", getScoreDeltaColor(survey.scoreDelta))}>
                        {survey.avgScore.toFixed(1)}/10
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {survey.scoreDelta > 0 ? '+' : ''}{survey.scoreDelta.toFixed(1)} vs previous
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flags */}
              {survey.flags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    Flags ({survey.flags.length})
                  </h4>
                  <div className="space-y-2">
                    {survey.flags.map((flag, index) => (
                      <div key={index} className={cn(
                        "flex items-center space-x-2 p-2 rounded-md border",
                        getFlagColor(flag.severity)
                      )}>
                        {getFlagIcon(flag.type)}
                        <span className="text-sm">{flag.message}</span>
                        <span className="text-xs opacity-75">
                          {formatDate(flag.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Urgent Comments */}
              {survey.urgentComments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                    Urgent Comments ({survey.urgentComments.length})
                  </h4>
                  <div className="space-y-2">
                    {survey.urgentComments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-2">{comment.text}</p>
                            <div className="flex items-center space-x-2">
                              {comment.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className={cn("text-xs", getTagColor(tag))}>
                                  {tag.replace('_', ' ')}
                                </Badge>
                              ))}
                              {comment.flagged && (
                                <Badge variant="destructive" className="text-xs">
                                  <Flag className="h-3 w-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {survey.flags.length > 0 && (
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Acknowledge Flags
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SurveyActivityLog; 