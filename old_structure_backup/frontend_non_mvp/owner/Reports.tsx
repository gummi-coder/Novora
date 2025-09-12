import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Download,
  Share2,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Trash2,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  DownloadCloud,
  Send,
  Link,
  FileSpreadsheet,
  FileImage,
  Presentation,
  RefreshCw,
  Info,
  UserPlus,
  Target,
  Clock3,
  FileDown,
  Share,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  lastGenerated: string;
  status: 'ready' | 'generating' | 'failed';
  format: 'pdf' | 'csv' | 'slides' | 'all';
}

interface ShareLink {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  views: number;
  accessCount: number;
}

interface ExecutiveContact {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastSent: string;
  frequency: 'monthly' | 'quarterly' | 'on-demand';
}

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [executiveContacts, setExecutiveContacts] = useState<ExecutiveContact[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'slides' | 'all'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);
  const [newShareLinkName, setNewShareLinkName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedExecutives, setSelectedExecutives] = useState<string[]>([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplateForAction, setSelectedTemplateForAction] = useState<ReportTemplate | null>(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        
        // Mock report templates
        const mockTemplates: ReportTemplate[] = [
          {
            id: "1",
            name: "Monthly Culture Summary",
            description: "Comprehensive monthly overview of organizational culture metrics",
            type: 'monthly',
            lastGenerated: "2024-01-15",
            status: 'ready',
            format: 'pdf'
          },
          {
            id: "2",
            name: "Quarterly Executive Report",
            description: "High-level quarterly insights for board and executive team",
            type: 'quarterly',
            lastGenerated: "2024-01-01",
            status: 'ready',
            format: 'slides'
          },
          {
            id: "3",
            name: "Annual Culture Review",
            description: "Complete annual analysis with year-over-year comparisons",
            type: 'annual',
            lastGenerated: "2023-12-31",
            status: 'ready',
            format: 'all'
          },
          {
            id: "4",
            name: "Department Performance Report",
            description: "Department-specific insights and recommendations",
            type: 'custom',
            lastGenerated: "2024-01-10",
            status: 'ready',
            format: 'pdf'
          }
        ];
        setReportTemplates(mockTemplates);

        // Mock share links
        const mockShareLinks: ShareLink[] = [
          {
            id: "1",
            name: "Q4 2023 Executive Summary",
            url: "https://novora.com/share/q4-2023-exec-summary",
            createdAt: "2024-01-01",
            expiresAt: "2024-02-01",
            isActive: true,
            views: 45,
            accessCount: 12
          },
          {
            id: "2",
            name: "December Culture Report",
            url: "https://novora.com/share/dec-2023-culture",
            createdAt: "2023-12-15",
            expiresAt: "2024-01-15",
            isActive: false,
            views: 23,
            accessCount: 8
          },
          {
            id: "3",
            name: "Board Meeting Slides",
            url: "https://novora.com/share/board-jan-2024",
            createdAt: "2024-01-10",
            expiresAt: "2024-02-10",
            isActive: true,
            views: 15,
            accessCount: 5
          }
        ];
        setShareLinks(mockShareLinks);

        // Mock executive contacts
        const mockExecutives: ExecutiveContact[] = [
          {
            id: "1",
            name: "Sarah Wilson",
            email: "sarah.wilson@novora.com",
            role: "CEO",
            department: "Executive",
            lastSent: "2024-01-15",
            frequency: 'monthly'
          },
          {
            id: "2",
            name: "Michael Chen",
            email: "michael.chen@novora.com",
            role: "CTO",
            department: "Technology",
            lastSent: "2024-01-10",
            frequency: 'quarterly'
          },
          {
            id: "3",
            name: "Lisa Rodriguez",
            email: "lisa.rodriguez@novora.com",
            role: "CHRO",
            department: "Human Resources",
            lastSent: "2024-01-12",
            frequency: 'monthly'
          },
          {
            id: "4",
            name: "David Kim",
            email: "david.kim@novora.com",
            role: "CFO",
            department: "Finance",
            lastSent: "2024-01-08",
            frequency: 'quarterly'
          }
        ];
        setExecutiveContacts(mockExecutives);
        
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

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a report template",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Success",
        description: `Report generated successfully in ${selectedFormat.toUpperCase()} format`,
      });
      setLoading(false);
    }, 2000);
  };

  const handleCreateShareLink = () => {
    if (!newShareLinkName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the share link",
        variant: "destructive"
      });
      return;
    }

    const newLink: ShareLink = {
      id: Date.now().toString(),
      name: newShareLinkName,
      url: `https://novora.com/share/${newShareLinkName.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      isActive: true,
      views: 0,
      accessCount: 0
    };

    setShareLinks([newLink, ...shareLinks]);
    setNewShareLinkName('');
    
    toast({
      title: "Success",
      description: "Share link created successfully",
    });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  const handleSendEmail = () => {
    if (selectedExecutives.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one executive",
        variant: "destructive"
      });
      return;
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in subject and message",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Email Sent",
      description: `Report sent to ${selectedExecutives.length} executive(s)`,
    });

    // Reset form
    setEmailSubject('');
    setEmailMessage('');
    setSelectedExecutives([]);
  };

  const handleDownloadLatest = (template: ReportTemplate) => {
    setSelectedTemplateForAction(template);
    setShowDownloadModal(true);
    toast({
      title: "Download Report",
      description: `Preparing ${template.name} for download...`,
    });
  };

  const handleCreateShareLinkAction = (template: ReportTemplate) => {
    setSelectedTemplateForAction(template);
    setShowShareLinkModal(true);
    toast({
      title: "Create Share Link",
      description: `Creating share link for ${template.name}...`,
    });
  };

  const handleEmailToExecutivesAction = (template: ReportTemplate) => {
    setSelectedTemplateForAction(template);
    setShowEmailModal(true);
    toast({
      title: "Email to Executives",
      description: `Opening email interface for ${template.name}...`,
    });
  };

  const handleDownloadReport = async (format: string) => {
    try {
      // Simulate file download
      const fileName = `${selectedTemplateForAction?.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format}`;
      const dataStr = `Mock report data for ${selectedTemplateForAction?.name} in ${format.toUpperCase()} format`;
      const dataBlob = new Blob([dataStr], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `${selectedTemplateForAction?.name} downloaded successfully`,
      });
      setShowDownloadModal(false);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  const handleCreateShareLinkForTemplate = async () => {
    try {
      // Simulate creating share link
      const newLink: ShareLink = {
        id: Date.now().toString(),
        name: `${selectedTemplateForAction?.name} - Shared`,
        url: `https://novora.com/reports/share/${Date.now()}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        isActive: true,
        views: 0,
        accessCount: 0
      };
      
      setShareLinks(prev => [newLink, ...prev]);
      
      toast({
        title: "Share Link Created",
        description: `Share link created for ${selectedTemplateForAction?.name}`,
      });
      setShowShareLinkModal(false);
    } catch (error) {
      toast({
        title: "Failed to Create Link",
        description: "Failed to create share link",
        variant: "destructive"
      });
    }
  };

  const handleSendEmailToExecutives = async () => {
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email Sent",
        description: `Report sent to ${selectedExecutives.length} executive(s)`,
      });
      setShowEmailModal(false);
      setSelectedExecutives([]);
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send email to executives",
        variant: "destructive"
      });
    }
  };

  const toggleExecutiveSelection = (executiveId: string) => {
    setSelectedExecutives(prev => 
      prev.includes(executiveId) 
        ? prev.filter(id => id !== executiveId)
        : [...prev, executiveId]
    );
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'csv': return <FileSpreadsheet className="w-4 h-4" />;
      case 'slides': return <Presentation className="w-4 h-4" />;
      case 'all': return <DownloadCloud className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100';
      case 'generating': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'generating': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Export and share insights with leadership through comprehensive reporting tools
          </p>
        </div>

        {/* Enhanced Report Generation */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Generate Reports</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Create and download culture reports with customizable options
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Template Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-semibold text-gray-900">Report Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
                    <SelectValue placeholder="Select a report template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(template.format)}
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold text-gray-900">Export Format</Label>
                <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                  <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="slides">PowerPoint Slides</SelectItem>
                    <SelectItem value="all">All Formats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Report Options */}
            <div className="space-y-4">
              <Label className="font-semibold text-gray-900">Report Options</Label>
              <div className="flex items-center space-x-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                  <Label className="font-medium">Include Charts & Visualizations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeComments}
                    onCheckedChange={setIncludeComments}
                  />
                  <Label className="font-medium">Include Anonymous Comments</Label>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateReport} 
              disabled={!selectedTemplate || loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate Report'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Report Templates Table */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Available Report Templates</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Pre-configured templates for different reporting needs
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Template</TableHead>
                    <TableHead className="font-semibold text-gray-900">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Format</TableHead>
                    <TableHead className="font-semibold text-gray-900">Last Generated</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportTemplates.map((template, index) => (
                    <TableRow 
                      key={template.id}
                      className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getFormatIcon(template.format)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(template.format)}
                          <span className="text-sm font-medium">{template.format.toUpperCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{new Date(template.lastGenerated).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(template.status)} px-3 py-1 font-medium`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(template.status)}
                            <span>{template.status.charAt(0).toUpperCase() + template.status.slice(1)}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleDownloadLatest(template)}
                              className="cursor-pointer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              <span>Download Latest</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleCreateShareLinkAction(template)}
                              className="cursor-pointer"
                            >
                              <Share2 className="mr-2 h-4 w-4" />
                              <span>Create Share Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEmailToExecutivesAction(template)}
                              className="cursor-pointer"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Email to Executives</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Share Links */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Public Share Links</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Create and manage public share links for reports with analytics
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Create New Share Link */}
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Enter share link name..."
                value={newShareLinkName}
                onChange={(e) => setNewShareLinkName(e.target.value)}
                className="flex-1 hover:border-blue-300 transition-colors duration-200"
              />
              <Button onClick={handleCreateShareLink} className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link className="w-4 h-4" />
                <span>Create Link</span>
              </Button>
            </div>

            {/* Enhanced Share Links Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">URL</TableHead>
                    <TableHead className="font-semibold text-gray-900">Created</TableHead>
                    <TableHead className="font-semibold text-gray-900">Expires</TableHead>
                    <TableHead className="font-semibold text-gray-900">Views</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareLinks.map((link, index) => (
                    <TableRow 
                      key={link.id}
                      className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <TableCell className="font-semibold text-gray-900">{link.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 truncate max-w-48">{link.url}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(link.url)}
                            className="hover:bg-gray-100"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{new Date(link.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold text-gray-900">{link.views} views</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={link.isActive ? "default" : "secondary"} className="px-3 py-1 font-medium">
                          {link.isActive ? 'Active' : 'Expired'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(link.url)}
                            className="hover:bg-gray-100"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                            className="hover:bg-gray-100"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Email to Executives */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <span>Email to Executives</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Send reports directly to board members and executives with custom messaging
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enhanced Executive Selection */}
            <div className="space-y-4">
              <Label className="font-semibold text-gray-900">Select Recipients</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {executiveContacts.map((executive) => (
                  <div
                    key={executive.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedExecutives.includes(executive.id)
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => toggleExecutiveSelection(executive.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {executive.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{executive.name}</div>
                          <div className="text-sm text-gray-600">{executive.role} • {executive.department}</div>
                          <div className="text-sm text-gray-500">{executive.email}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Last sent: {new Date(executive.lastSent).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Email Content */}
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-gray-900">Subject</Label>
                <Input
                  placeholder="Enter email subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="hover:border-blue-300 transition-colors duration-200"
                />
              </div>
              <div>
                <Label className="font-semibold text-gray-900">Message</Label>
                <Textarea
                  placeholder="Enter your message..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={4}
                  className="hover:border-blue-300 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Enhanced Send Button */}
            <Button 
              onClick={handleSendEmail}
              disabled={selectedExecutives.length === 0 || !emailSubject.trim() || !emailMessage.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Send className="w-4 h-4" />
              <span>Send to {selectedExecutives.length} Executive(s)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Download Latest Modal */}
        <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileDown className="w-6 h-6 text-blue-600" />
                <span>Download {selectedTemplateForAction?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Choose the format and download the latest version of this report
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Select Format</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 p-4 h-auto"
                    onClick={() => handleDownloadReport('pdf')}
                  >
                    <FileText className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <div className="font-semibold">PDF Report</div>
                      <div className="text-sm text-gray-500">Professional format</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 p-4 h-auto"
                    onClick={() => handleDownloadReport('csv')}
                  >
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-semibold">CSV Data</div>
                      <div className="text-sm text-gray-500">Raw data export</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 p-4 h-auto"
                    onClick={() => handleDownloadReport('slides')}
                  >
                    <Presentation className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <div className="font-semibold">PowerPoint</div>
                      <div className="text-sm text-gray-500">Presentation ready</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 p-4 h-auto"
                    onClick={() => handleDownloadReport('all')}
                  >
                    <DownloadCloud className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-semibold">All Formats</div>
                      <div className="text-sm text-gray-500">Complete package</div>
                    </div>
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDownloadModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Share Link Modal */}
        <Dialog open={showShareLinkModal} onOpenChange={setShowShareLinkModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Share className="w-6 h-6 text-purple-600" />
                <span>Create Share Link for {selectedTemplateForAction?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Create a public share link for this report with customizable settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Link Name</Label>
                <Input 
                  placeholder={`${selectedTemplateForAction?.name} - Shared Report`}
                  className="hover:border-purple-300 transition-colors duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Expiration</Label>
                <Select defaultValue="30">
                  <SelectTrigger className="hover:border-purple-300 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never expires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Access Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Require password</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Track views and downloads</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Allow comments</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowShareLinkModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateShareLinkForTemplate}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Create Share Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Email to Executives Modal */}
        <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-orange-600" />
                <span>Email {selectedTemplateForAction?.name} to Executives</span>
              </DialogTitle>
              <DialogDescription>
                Send this report directly to board members and executives with custom messaging
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Executive Selection */}
              <div className="space-y-4">
                <Label className="font-semibold text-gray-900">Select Recipients</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {executiveContacts.map((executive) => (
                    <div
                      key={executive.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedExecutives.includes(executive.id)
                          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => toggleExecutiveSelection(executive.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {executive.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{executive.name}</div>
                            <div className="text-sm text-gray-600">{executive.role} • {executive.department}</div>
                            <div className="text-sm text-gray-500">{executive.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Last sent: {new Date(executive.lastSent).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Content */}
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold text-gray-900">Subject</Label>
                  <Input
                    placeholder={`${selectedTemplateForAction?.name} - Executive Report`}
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="hover:border-orange-300 transition-colors duration-200"
                  />
                </div>
                <div>
                  <Label className="font-semibold text-gray-900">Message</Label>
                  <Textarea
                    placeholder="Enter your message to executives..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={4}
                    className="hover:border-orange-300 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Report Options */}
              <div className="space-y-4">
                <Label className="font-semibold text-gray-900">Report Options</Label>
                <div className="flex items-center space-x-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label className="font-medium">Include Executive Summary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label className="font-medium">Include Action Items</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label className="font-medium">Include Raw Data</Label>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendEmailToExecutives}
                  disabled={selectedExecutives.length === 0 || !emailSubject.trim() || !emailMessage.trim()}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to {selectedExecutives.length} Executive(s)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Reports; 