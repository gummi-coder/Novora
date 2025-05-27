import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, ThumbsUp, MessageSquare, Star } from 'lucide-react';

type FeedbackType = 'suggestion' | 'bug' | 'feature' | 'praise' | 'complaint';
type FeedbackStatus = 'new' | 'under-review' | 'planned' | 'implemented' | 'declined';
type FeedbackPriority = 'low' | 'medium' | 'high';

interface Feedback {
  id: string;
  title: string;
  description: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  createdAt: string;
  updatedAt: string;
  submittedBy: string;
  votes: number;
  comments: Array<{
    id: string;
    content: string;
    author: string;
    timestamp: string;
  }>;
}

const initialFeedback: Feedback[] = [
  {
    id: 'FB-001',
    title: 'Add dark mode support',
    description: 'Please add a dark mode option for better visibility in low-light conditions',
    type: 'feature',
    status: 'under-review',
    priority: 'medium',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    submittedBy: 'John Doe',
    votes: 15,
    comments: [
      {
        id: 'C-001',
        content: 'This would be a great addition!',
        author: 'Jane Smith',
        timestamp: '2024-03-15T11:00:00Z'
      }
    ]
  },
  {
    id: 'FB-002',
    title: 'Survey export format issue',
    description: 'CSV export is not formatting dates correctly',
    type: 'bug',
    status: 'new',
    priority: 'high',
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-14T15:30:00Z',
    submittedBy: 'Alice Johnson',
    votes: 8,
    comments: []
  }
];

const typeColors: Record<FeedbackType, string> = {
  'suggestion': 'bg-blue-100 text-blue-800',
  'bug': 'bg-red-100 text-red-800',
  'feature': 'bg-green-100 text-green-800',
  'praise': 'bg-yellow-100 text-yellow-800',
  'complaint': 'bg-orange-100 text-orange-800'
};

const statusColors: Record<FeedbackStatus, string> = {
  'new': 'bg-gray-100 text-gray-800',
  'under-review': 'bg-blue-100 text-blue-800',
  'planned': 'bg-yellow-100 text-yellow-800',
  'implemented': 'bg-green-100 text-green-800',
  'declined': 'bg-red-100 text-red-800'
};

export function FeedbackSystem() {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '' as FeedbackType | '',
    status: '' as FeedbackStatus | '',
    priority: '' as FeedbackPriority | ''
  });
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [newFeedback, setNewFeedback] = useState<Partial<Feedback>>({
    title: '',
    description: '',
    type: 'suggestion',
    priority: 'medium'
  });
  const [newComment, setNewComment] = useState('');

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filters.type || item.type === filters.type;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesPriority = !filters.priority || item.priority === filters.priority;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const handleCreateFeedback = () => {
    const feedbackItem: Feedback = {
      id: `FB-${String(feedback.length + 1).padStart(3, '0')}`,
      title: newFeedback.title || '',
      description: newFeedback.description || '',
      type: newFeedback.type || 'suggestion',
      status: 'new',
      priority: newFeedback.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedBy: 'Current User', // This would come from your auth system
      votes: 0,
      comments: []
    };

    setFeedback([...feedback, feedbackItem]);
    setNewFeedback({
      title: '',
      description: '',
      type: 'suggestion',
      priority: 'medium'
    });
  };

  const handleVote = (feedbackId: string) => {
    setFeedback(feedback.map(item =>
      item.id === feedbackId ? { ...item, votes: item.votes + 1 } : item
    ));
  };

  const handleAddComment = (feedbackId: string) => {
    if (!newComment.trim()) return;

    const comment = {
      id: `C-${Date.now()}`,
      content: newComment,
      author: 'Current User', // This would come from your auth system
      timestamp: new Date().toISOString()
    };

    setFeedback(feedback.map(item =>
      item.id === feedbackId
        ? { ...item, comments: [...item.comments, comment] }
        : item
    ));

    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Feedback
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                  placeholder="Brief description of your feedback"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                  placeholder="Detailed description of your feedback"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newFeedback.type}
                  onValueChange={(value: FeedbackType) => setNewFeedback({ ...newFeedback, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="praise">Praise</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newFeedback.priority}
                  onValueChange={(value: FeedbackPriority) => setNewFeedback({ ...newFeedback, priority: value })}
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
              <Button onClick={handleCreateFeedback} className="w-full">
                Submit Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Feedback</CardTitle>
            <div className="flex items-center space-x-2">
              <Select
                value={filters.type}
                onValueChange={(value: FeedbackType | '') => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value: FeedbackStatus | '') => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.priority}
                onValueChange={(value: FeedbackPriority | '') => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <Badge className={typeColors[item.type]}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{item.votes}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.submittedBy}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-4xl">
          {selectedFeedback && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{selectedFeedback.title}</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Feedback #{selectedFeedback.id}</span>
                  <span>•</span>
                  <span>Submitted by {selectedFeedback.submittedBy}</span>
                  <span>•</span>
                  <span>Created {new Date(selectedFeedback.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{selectedFeedback.description}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge className={typeColors[selectedFeedback.type]}>
                          {selectedFeedback.type}
                        </Badge>
                        <Badge className={statusColors[selectedFeedback.status]}>
                          {selectedFeedback.status}
                        </Badge>
                        <Badge variant="outline">
                          {selectedFeedback.priority} Priority
                        </Badge>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => handleVote(selectedFeedback.id)}
                        className="w-full"
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Vote ({selectedFeedback.votes})
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Comments</h3>
                      <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-4">
                          {selectedFeedback.comments.map((comment) => (
                            <div key={comment.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{comment.author}</span>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="space-y-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="min-h-[100px]"
                        />
                        <Button
                          onClick={() => handleAddComment(selectedFeedback.id)}
                          className="w-full"
                        >
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Type</h3>
                      <Badge className={typeColors[selectedFeedback.type]}>
                        {selectedFeedback.type}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Status</h3>
                      <Badge className={statusColors[selectedFeedback.status]}>
                        {selectedFeedback.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Priority</h3>
                      <p className="text-sm">{selectedFeedback.priority}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Votes</h3>
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{selectedFeedback.votes}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Comments</h3>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{selectedFeedback.comments.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 