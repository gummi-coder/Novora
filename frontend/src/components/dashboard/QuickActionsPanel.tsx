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
  FileText,
  Download,
  Share2,
  Calendar,
  Users,
  BarChart3,
  AlertTriangle,
  Eye,
  Copy,
  ExternalLink,
  Clock,
  Settings,
  RefreshCw,
  Archive,
  Globe,
  Lock,
  CheckCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MonthlyDigest {
  id: string;
  month: string;
  title: string;
  status: 'generated' | 'generating' | 'failed';
  generatedAt: string;
  downloadUrl?: string;
  shareUrl?: string;
  summary: {
    overallScore: number;
    participationRate: number;
    totalResponses: number;
    alertCount: number;
    topTeams: string[];
    keyInsights: string[];
  };
}

interface ExportJob {
  id: string;
  type: 'csv' | 'pdf';
  format: 'raw' | 'summary';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileName: string;
}

interface ShareLink {
  id: string;
  title: string;
  url: string;
  token: string;
  expiresAt: string;
  isActive: boolean;
  accessCount: number;
  lastAccessed?: string;
  permissions: {
    canDownload: boolean;
    canShare: boolean;
    requiresAuth: boolean;
  };
}

const QuickActionsPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [monthlyDigests, setMonthlyDigests] = useState<MonthlyDigest[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [activeTab, setActiveTab] = useState('digests');
  
  // Export form state
  const [exportForm, setExportForm] = useState({
    type: 'pdf',
    format: 'summary',
    dateRange: 'last-month',
    includeCharts: true,
    includeComments: false
  });

  // Share link form state
  const [shareForm, setShareForm] = useState({
    title: '',
    expiresIn: '30',
    canDownload: true,
    canShare: false,
    requiresAuth: false
  });

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        
        // Mock monthly digests data
        const mockDigests: MonthlyDigest[] = [
          {
            id: "1",
            month: "June 2024",
            title: "June 2024 Team Sentiment Report",
            status: 'generated',
            generatedAt: new Date(Date.now() - 86400000).toISOString(),
            downloadUrl: "#",
            shareUrl: "#",
            summary: {
              overallScore: 7.3,
              participationRate: 78,
              totalResponses: 122,
              alertCount: 2,
              topTeams: ["Engineering", "Marketing"],
              keyInsights: [
                "Engineering team showed 15% improvement in collaboration scores",
                "Sales team needs attention due to 2.1 point score drop",
                "Overall participation increased by 8% compared to May"
              ]
            }
          },
          {
            id: "2",
            month: "May 2024",
            title: "May 2024 Team Sentiment Report",
            status: 'generated',
            generatedAt: new Date(Date.now() - 2592000000).toISOString(),
            downloadUrl: "#",
            shareUrl: "#",
            summary: {
              overallScore: 7.1,
              participationRate: 72,
              totalResponses: 118,
              alertCount: 1,
              topTeams: ["Marketing", "HR"],
              keyInsights: [
                "Marketing team led with highest satisfaction scores",
                "New remote work policies well received",
                "Training program feedback was positive"
              ]
            }
          },
          {
            id: "3",
            month: "April 2024",
            title: "April 2024 Team Sentiment Report",
            status: 'generating',
            generatedAt: new Date(Date.now() - 5184000000).toISOString(),
            summary: {
              overallScore: 6.9,
              participationRate: 68,
              totalResponses: 105,
              alertCount: 3,
              topTeams: ["Engineering", "Sales"],
              keyInsights: [
                "Initial implementation of new survey system",
                "Some teams showed resistance to change",
                "Overall scores below target, action needed"
              ]
            }
          }
        ];
        setMonthlyDigests(mockDigests);

        // Mock export jobs data
        const mockExportJobs: ExportJob[] = [
          {
            id: "1",
            type: 'pdf',
            format: 'summary',
            status: 'completed',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            completedAt: new Date(Date.now() - 3500000).toISOString(),
            downloadUrl: "#",
            fileName: "team_sentiment_summary_june_2024.pdf"
          },
          {
            id: "2",
            type: 'csv',
            format: 'raw',
            status: 'processing',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            fileName: "raw_survey_data_june_2024.csv"
          },
          {
            id: "3",
            type: 'pdf',
            format: 'summary',
            status: 'queued',
            createdAt: new Date(Date.now() - 900000).toISOString(),
            fileName: "executive_summary_june_2024.pdf"
          }
        ];
        setExportJobs(mockExportJobs);

        // Mock share links data
        const mockShareLinks: ShareLink[] = [
          {
            id: "1",
            title: "June 2024 Executive Summary",
            url: "https://novora.com/reports/abc123",
            token: "abc123",
            expiresAt: new Date(Date.now() + 2592000000).toISOString(), // 30 days
            isActive: true,
            accessCount: 12,
            lastAccessed: new Date(Date.now() - 3600000).toISOString(),
            permissions: {
              canDownload: true,
              canShare: false,
              requiresAuth: false
            }
          },
          {
            id: "2",
            title: "Q2 Team Performance Report",
            url: "https://novora.com/reports/def456",
            token: "def456",
            expiresAt: new Date(Date.now() + 604800000).toISOString(), // 7 days
            isActive: true,
            accessCount: 5,
            lastAccessed: new Date(Date.now() - 86400000).toISOString(),
            permissions: {
              canDownload: false,
              canShare: true,
              requiresAuth: true
            }
          },
          {
            id: "3",
            title: "May 2024 Board Report",
            url: "https://novora.com/reports/ghi789",
            token: "ghi789",
            expiresAt: new Date(Date.now() - 86400000).toISOString(), // Expired
            isActive: false,
            accessCount: 8,
            lastAccessed: new Date(Date.now() - 172800000).toISOString(),
            permissions: {
              canDownload: true,
              canShare: false,
              requiresAuth: false
            }
          }
        ];
        setShareLinks(mockShareLinks);
        
      } catch (error) {
        console.error('Error fetching reports data:', error);
        toast({
          title: "Error",
          description: "Failed to load reports data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, [toast]);

  const generateMonthlyDigest = async () => {
    try {
      toast({
        title: "Generating Digest",
        description: "Monthly digest is being generated...",
      });
      
      // Mock generation
      setTimeout(() => {
        toast({
          title: "Digest Generated",
          description: "Monthly digest has been created successfully",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate monthly digest",
        variant: "destructive"
      });
    }
  };

  const createExportJob = async () => {
    try {
      const newJob: ExportJob = {
        id: Date.now().toString(),
        type: exportForm.type as 'csv' | 'pdf',
        format: exportForm.format as 'raw' | 'summary',
        status: 'queued',
        createdAt: new Date().toISOString(),
        fileName: `${exportForm.type}_${exportForm.format}_${new Date().toISOString().split('T')[0]}.${exportForm.type}`
      };
      
      setExportJobs(prev => [newJob, ...prev]);
      
      toast({
        title: "Export Queued",
        description: "Your export has been added to the queue",
      });
      
      // Mock processing
      setTimeout(() => {
        setExportJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'completed', completedAt: new Date().toISOString(), downloadUrl: '#' }
            : job
        ));
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create export job",
        variant: "destructive"
      });
    }
  };

  const createShareLink = async () => {
    try {
      const newLink: ShareLink = {
        id: Date.now().toString(),
        title: shareForm.title,
        url: `https://novora.com/reports/${Math.random().toString(36).substr(2, 9)}`,
        token: Math.random().toString(36).substr(2, 9),
        expiresAt: new Date(Date.now() + parseInt(shareForm.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        accessCount: 0,
        permissions: {
          canDownload: shareForm.canDownload,
          canShare: shareForm.canShare,
          requiresAuth: shareForm.requiresAuth
        }
      };
      
      setShareLinks(prev => [newLink, ...prev]);
      
      toast({
        title: "Share Link Created",
        description: "Your share link has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'queued': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Share results with leadership and create historical archives</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={generateMonthlyDigest}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Digest
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="digests" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Monthly Digests</span>
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Tools</span>
          </TabsTrigger>
          <TabsTrigger value="shares" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share Links</span>
          </TabsTrigger>
        </TabsList>

        {/* Monthly Digests Tab */}
        <TabsContent value="digests" className="space-y-6">
          <div className="grid gap-6">
            {monthlyDigests.map((digest) => (
              <Card key={digest.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>{digest.title}</span>
                        <Badge className={getStatusColor(digest.status)}>
                          {digest.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Generated on {formatDate(digest.generatedAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {digest.status === 'generated' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </>
                      )}
                      {digest.status === 'generating' && (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">Generating...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{digest.summary.overallScore}/10</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{digest.summary.participationRate}%</div>
                      <div className="text-sm text-gray-600">Participation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{digest.summary.totalResponses}</div>
                      <div className="text-sm text-gray-600">Responses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{digest.summary.alertCount}</div>
                      <div className="text-sm text-gray-600">Alerts</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Top Performing Teams</h4>
                      <div className="flex items-center space-x-2">
                        {digest.summary.topTeams.map((team) => (
                          <Badge key={team} variant="outline">
                            {team}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                      <ul className="space-y-1">
                        {digest.summary.keyInsights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Export Tools Tab */}
        <TabsContent value="exports" className="space-y-6">
          {/* Export Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Create Export</span>
              </CardTitle>
              <CardDescription>Generate CSV or PDF reports with your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Export Type</Label>
                  <Select value={exportForm.type} onValueChange={(value) => setExportForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={exportForm.format} onValueChange={(value) => setExportForm(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Only</SelectItem>
                      <SelectItem value="raw">Raw Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={exportForm.dateRange} onValueChange={(value) => setExportForm(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={exportForm.includeCharts}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeCharts: checked as boolean }))}
                  />
                  <Label htmlFor="includeCharts">Include Charts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeComments"
                    checked={exportForm.includeComments}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeComments: checked as boolean }))}
                  />
                  <Label htmlFor="includeComments">Include Comments</Label>
                </div>
              </div>

              <Button onClick={createExportJob} className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Create Export
              </Button>
            </CardContent>
          </Card>

          {/* Export Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>Track your export jobs and download completed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{job.fileName}</span>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(job.createdAt)}
                      </span>
                      {job.status === 'completed' && job.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Links Tab */}
        <TabsContent value="shares" className="space-y-6">
          {/* Create Share Link Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="w-5 h-5" />
                <span>Create Share Link</span>
              </CardTitle>
              <CardDescription>Generate public URLs for sharing reports with stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Title</Label>
                  <Input
                    placeholder="e.g., June 2024 Executive Summary"
                    value={shareForm.title}
                    onChange={(e) => setShareForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expires In</Label>
                  <Select value={shareForm.expiresIn} onValueChange={(value) => setShareForm(prev => ({ ...prev, expiresIn: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canDownload"
                    checked={shareForm.canDownload}
                    onCheckedChange={(checked) => setShareForm(prev => ({ ...prev, canDownload: checked as boolean }))}
                  />
                  <Label htmlFor="canDownload">Allow Downloads</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canShare"
                    checked={shareForm.canShare}
                    onCheckedChange={(checked) => setShareForm(prev => ({ ...prev, canShare: checked as boolean }))}
                  />
                  <Label htmlFor="canShare">Allow Sharing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresAuth"
                    checked={shareForm.requiresAuth}
                    onCheckedChange={(checked) => setShareForm(prev => ({ ...prev, requiresAuth: checked as boolean }))}
                  />
                  <Label htmlFor="requiresAuth">Require Authentication</Label>
                </div>
              </div>

              <Button onClick={createShareLink} className="mt-4" disabled={!shareForm.title}>
                <Share2 className="w-4 h-4 mr-2" />
                Create Share Link
              </Button>
            </CardContent>
          </Card>

          {/* Share Links List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Share Links</CardTitle>
              <CardDescription>Manage your public report links and track usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shareLinks.map((link) => (
                  <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{link.title}</h4>
                        <p className="text-sm text-gray-500">{link.url}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={link.isActive ? "default" : "secondary"}>
                          {link.isActive ? "Active" : "Expired"}
                        </Badge>
                        {link.permissions.requiresAuth && (
                          <Lock className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Access Count</div>
                        <div className="font-medium">{link.accessCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Expires</div>
                        <div className="font-medium">{formatDate(link.expiresAt)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Last Accessed</div>
                        <div className="font-medium">
                          {link.lastAccessed ? formatDate(link.lastAccessed) : "Never"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Permissions</div>
                        <div className="flex items-center space-x-1">
                          {link.permissions.canDownload && <Download className="w-3 h-3 text-green-600" />}
                          {link.permissions.canShare && <Share2 className="w-3 h-3 text-blue-600" />}
                          {link.permissions.requiresAuth && <Lock className="w-3 h-3 text-gray-600" />}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.url)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickActionsPanel; 