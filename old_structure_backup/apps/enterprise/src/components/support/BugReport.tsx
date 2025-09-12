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
import { Plus, Search, Bug, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
type BugStatus = 'new' | 'investigating' | 'in-progress' | 'fixed' | 'verified' | 'closed';
type BugEnvironment = 'development' | 'staging' | 'production';

interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  severity: BugSeverity;
  status: BugStatus;
  environment: BugEnvironment;
  browser?: string;
  os?: string;
  createdAt: string;
  updatedAt: string;
  reportedBy: string;
  assignedTo?: string;
  attachments?: string[];
  comments: Array<{
    id: string;
    content: string;
    author: string;
    authorRole: string;
    timestamp: string;
    isInternal?: boolean;
  }>;
}

const initialBugs: BugReport[] = [
  {
    id: 'BUG-001',
    title: 'Survey submission fails on mobile devices',
    description: 'Users are unable to submit surveys when using mobile devices',
    stepsToReproduce: [
      'Open the survey on a mobile device',
      'Fill out all required fields',
      'Click the submit button'
    ],
    expectedBehavior: 'Survey should submit successfully',
    actualBehavior: 'Submit button does not respond',
    severity: 'high',
    status: 'investigating',
    environment: 'production',
    browser: 'Chrome Mobile 120',
    os: 'iOS 17.2',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    reportedBy: 'John Doe',
    assignedTo: 'Mobile Team',
    comments: [
      {
        id: 'C-001',
        content: 'Investigating the issue with mobile form submission',
        author: 'Sarah Johnson',
        authorRole: 'Mobile Developer',
        timestamp: '2024-03-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'BUG-002',
    title: 'Analytics dashboard shows incorrect data',
    description: 'The analytics dashboard displays incorrect survey response statistics',
    stepsToReproduce: [
      'Navigate to the analytics dashboard',
      'Select date range for last 30 days',
      'Compare with raw data export'
    ],
    expectedBehavior: 'Dashboard should match exported data',
    actualBehavior: 'Dashboard shows 20% higher numbers',
    severity: 'medium',
    status: 'new',
    environment: 'production',
    browser: 'Firefox 123',
    os: 'Windows 11',
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-14T15:30:00Z',
    reportedBy: 'Alice Smith',
    comments: []
  }
];

const severityColors: Record<BugSeverity, string> = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'critical': 'bg-red-100 text-red-800'
};

const statusColors: Record<BugStatus, string> = {
  'new': 'bg-blue-100 text-blue-800',
  'investigating': 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'fixed': 'bg-green-100 text-green-800',
  'verified': 'bg-emerald-100 text-emerald-800',
  'closed': 'bg-gray-100 text-gray-800'
};

export function BugReport() {
  const [bugs, setBugs] = useState<BugReport[]>(initialBugs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    severity: '' as BugSeverity | '',
    status: '' as BugStatus | '',
    environment: '' as BugEnvironment | ''
  });
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [newBug, setNewBug] = useState<Partial<BugReport>>({
    title: '',
    description: '',
    stepsToReproduce: [''],
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'medium',
    environment: 'production',
    browser: '',
    os: ''
  });
  const [newComment, setNewComment] = useState('');

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = 
      bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = !filters.severity || bug.severity === filters.severity;
    const matchesStatus = !filters.status || bug.status === filters.status;
    const matchesEnvironment = !filters.environment || bug.environment === filters.environment;

    return matchesSearch && matchesSeverity && matchesStatus && matchesEnvironment;
  });

  const handleCreateBug = () => {
    const bugReport: BugReport = {
      id: `BUG-${String(bugs.length + 1).padStart(3, '0')}`,
      title: newBug.title || '',
      description: newBug.description || '',
      stepsToReproduce: newBug.stepsToReproduce || [''],
      expectedBehavior: newBug.expectedBehavior || '',
      actualBehavior: newBug.actualBehavior || '',
      severity: newBug.severity || 'medium',
      status: 'new',
      environment: newBug.environment || 'production',
      browser: newBug.browser,
      os: newBug.os,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reportedBy: 'Current User', // This would come from your auth system
      comments: []
    };

    setBugs([...bugs, bugReport]);
    setNewBug({
      title: '',
      description: '',
      stepsToReproduce: [''],
      expectedBehavior: '',
      actualBehavior: '',
      severity: 'medium',
      environment: 'production',
      browser: '',
      os: ''
    });
  };

  const handleAddStep = () => {
    setNewBug({
      ...newBug,
      stepsToReproduce: [...(newBug.stepsToReproduce || []), '']
    });
  };

  const handleStepChange = (index: number, value: string) => {
    const steps = [...(newBug.stepsToReproduce || [])];
    steps[index] = value;
    setNewBug({ ...newBug, stepsToReproduce: steps });
  };

  const handleAddComment = (bugId: string) => {
    if (!newComment.trim()) return;

    const comment = {
      id: `C-${Date.now()}`,
      content: newComment,
      author: 'Current User', // This would come from your auth system
      authorRole: 'Reporter',
      timestamp: new Date().toISOString()
    };

    setBugs(bugs.map(bug =>
      bug.id === bugId
        ? { ...bug, comments: [...bug.comments, comment] }
        : bug
    ));

    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bug reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Bug
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Report a Bug</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  placeholder="Brief description of the bug"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  placeholder="Detailed description of the bug"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Steps to Reproduce</label>
                {(newBug.stepsToReproduce || []).map((step, index) => (
                  <div key={index} className="flex space-x-2">
                    <span className="text-sm font-medium mt-2">{index + 1}.</span>
                    <Input
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddStep}
                  className="w-full"
                >
                  Add Step
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Behavior</label>
                <Textarea
                  value={newBug.expectedBehavior}
                  onChange={(e) => setNewBug({ ...newBug, expectedBehavior: e.target.value })}
                  placeholder="What should happen?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Actual Behavior</label>
                <Textarea
                  value={newBug.actualBehavior}
                  onChange={(e) => setNewBug({ ...newBug, actualBehavior: e.target.value })}
                  placeholder="What actually happens?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select
                    value={newBug.severity}
                    onValueChange={(value: BugSeverity) => setNewBug({ ...newBug, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Environment</label>
                  <Select
                    value={newBug.environment}
                    onValueChange={(value: BugEnvironment) => setNewBug({ ...newBug, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Browser</label>
                  <Input
                    value={newBug.browser}
                    onChange={(e) => setNewBug({ ...newBug, browser: e.target.value })}
                    placeholder="e.g., Chrome 120"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Operating System</label>
                  <Input
                    value={newBug.os}
                    onChange={(e) => setNewBug({ ...newBug, os: e.target.value })}
                    placeholder="e.g., Windows 11"
                  />
                </div>
              </div>
              <Button onClick={handleCreateBug} className="w-full">
                Submit Bug Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bug Reports</CardTitle>
            <div className="flex items-center space-x-2">
              <Select
                value={filters.severity}
                onValueChange={(value: BugSeverity | '') => setFilters({ ...filters, severity: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value: BugStatus | '') => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.environment}
                onValueChange={(value: BugEnvironment | '') => setFilters({ ...filters, environment: value })}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Environments</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
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
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBugs.map((bug) => (
                  <TableRow
                    key={bug.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedBug(bug)}
                  >
                    <TableCell>{bug.id}</TableCell>
                    <TableCell>{bug.title}</TableCell>
                    <TableCell>
                      <Badge className={severityColors[bug.severity]}>
                        {bug.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[bug.status]}>
                        {bug.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{bug.environment}</TableCell>
                    <TableCell>{bug.reportedBy}</TableCell>
                    <TableCell>{new Date(bug.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBug} onOpenChange={() => setSelectedBug(null)}>
        <DialogContent className="max-w-4xl">
          {selectedBug && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{selectedBug.title}</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Bug #{selectedBug.id}</span>
                  <span>•</span>
                  <span>Reported by {selectedBug.reportedBy}</span>
                  <span>•</span>
                  <span>Created {new Date(selectedBug.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground">{selectedBug.description}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Steps to Reproduce</h3>
                        <ol className="list-decimal list-inside space-y-2">
                          {selectedBug.stepsToReproduce.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Expected Behavior</h3>
                          <p className="text-sm text-muted-foreground">{selectedBug.expectedBehavior}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Actual Behavior</h3>
                          <p className="text-sm text-muted-foreground">{selectedBug.actualBehavior}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge className={severityColors[selectedBug.severity]}>
                          {selectedBug.severity} Severity
                        </Badge>
                        <Badge className={statusColors[selectedBug.status]}>
                          {selectedBug.status}
                        </Badge>
                        <Badge variant="outline">
                          {selectedBug.environment}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Comments</h3>
                      <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-4">
                          {selectedBug.comments.map((comment) => (
                            <div key={comment.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{comment.author}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {comment.authorRole}
                                  </span>
                                </div>
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
                          onClick={() => handleAddComment(selectedBug.id)}
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
                    <CardTitle>Bug Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Severity</h3>
                      <Badge className={severityColors[selectedBug.severity]}>
                        {selectedBug.severity}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Status</h3>
                      <Badge className={statusColors[selectedBug.status]}>
                        {selectedBug.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Environment</h3>
                      <p className="text-sm">{selectedBug.environment}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Browser</h3>
                      <p className="text-sm">{selectedBug.browser || 'Not specified'}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Operating System</h3>
                      <p className="text-sm">{selectedBug.os || 'Not specified'}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Assigned To</h3>
                      <p className="text-sm">{selectedBug.assignedTo || 'Unassigned'}</p>
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