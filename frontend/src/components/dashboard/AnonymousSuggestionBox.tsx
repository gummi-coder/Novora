import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  Star, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewing' | 'planned' | 'implemented' | 'declined';
  submittedAt: string;
  votes: number;
  userVoted?: boolean;
}

const AnonymousSuggestionBox = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: "1",
      title: "Dark Mode Theme",
      description: "Add a dark mode option for better user experience, especially for users working in low-light environments.",
      category: "UI/UX",
      priority: "medium",
      status: "reviewing",
      submittedAt: "2024-01-15T10:30:00Z",
      votes: 12
    },
    {
      id: "2",
      title: "Bulk Survey Export",
      description: "Allow exporting multiple surveys at once in different formats (PDF, Excel, CSV).",
      category: "Export",
      priority: "high",
      status: "planned",
      submittedAt: "2024-01-14T14:20:00Z",
      votes: 8
    },
    {
      id: "3",
      title: "Mobile App",
      description: "Create a mobile app for responding to surveys on the go.",
      category: "Mobile",
      priority: "high",
      status: "planned",
      submittedAt: "2024-01-13T09:15:00Z",
      votes: 15
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "UI/UX", "Export", "Mobile", "Analytics", "Integration", 
    "Survey Features", "Reporting", "Security", "Performance", "Other"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewing': return <AlertCircle className="h-4 w-4" />;
      case 'planned': return <Star className="h-4 w-4" />;
      case 'implemented': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await api.submitSuggestion(formData);
      
      const newSuggestion: Suggestion = {
        id: response.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        votes: 0
      };

      setSuggestions(prev => [newSuggestion, ...prev]);
      setFormData({ title: "", description: "", category: "", priority: "medium" });
      setShowForm(false);
      
      toast({
        title: "Suggestion Submitted!",
        description: "Thank you for your feedback. We'll review it soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (suggestionId: string) => {
    try {
      await api.voteSuggestion(suggestionId);
      
      setSuggestions(prev => prev.map(suggestion => {
        if (suggestion.id === suggestionId) {
          return {
            ...suggestion,
            votes: suggestion.userVoted ? suggestion.votes - 1 : suggestion.votes + 1,
            userVoted: !suggestion.userVoted
          };
        }
        return suggestion;
      }));

      toast({
        title: "Vote Recorded",
        description: "Your vote has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Anonymous Suggestion Box
        </CardTitle>
        <CardDescription>
          Share your ideas for improving Novora. All suggestions are anonymous and reviewed by our team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submit New Suggestion */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Submit a New Suggestion</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showForm ? 'Cancel' : 'New Suggestion'}
            </Button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Suggestion Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for your suggestion"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of your suggestion..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Suggestion
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Recent Suggestions */}
        <div>
          <h3 className="font-medium mb-4">Recent Suggestions</h3>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                      <Badge className={getStatusColor(suggestion.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(suggestion.status)}
                          <span>{suggestion.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Category: {suggestion.category}</span>
                      <span>Submitted: {formatDate(suggestion.submittedAt)}</span>
                      <span>{suggestion.votes} votes</span>
                    </div>
                  </div>
                  <Button
                    variant={suggestion.userVoted ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVote(suggestion.id)}
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    {suggestion.userVoted ? 'Voted' : 'Vote'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
            <div className="text-sm text-gray-600">Total Suggestions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {suggestions.filter(s => s.status === 'implemented').length}
            </div>
            <div className="text-sm text-gray-600">Implemented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {suggestions.filter(s => s.status === 'planned').length}
            </div>
            <div className="text-sm text-gray-600">Planned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousSuggestionBox; 