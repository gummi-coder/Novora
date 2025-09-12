
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Download, File, FileText, Edit, Clock, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Define interfaces for the report types to fix TypeScript errors
interface ReportLog {
  timestamp: string;
  message: string;
  type: string;
}

interface CompleteReport {
  id: string;
  name: string;
  type: string;
  source: string;
  dateRange: string;
  created: string;
  status: string;
  formats: string[];
  fileSize?: {
    pdf?: string;
    csv?: string;
  };
  previewImages?: string[];
  generationLogs: ReportLog[];
}

interface FailedReport {
  id: string;
  name: string;
  type: string;
  source: string;
  dateRange: string;
  created: string;
  status: string;
  formats: string[];
  generationLogs: ReportLog[];
}

type ReportType = CompleteReport | FailedReport;

const ReportDetail = () => {
  const { reportId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Mock data for a single report
  const mockReport: CompleteReport = {
    id: reportId,
    name: "Q1 Engagement Summary",
    type: "Overall Summary",
    source: "All Surveys",
    dateRange: "Jan 1 - Mar 31, 2025",
    created: "Apr 5, 2025 11:45 AM",
    status: "Complete",
    formats: ["pdf", "csv"],
    fileSize: {
      pdf: "2.5 MB",
      csv: "312 KB"
    },
    previewImages: [
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    generationLogs: [
      { timestamp: "Apr 5, 2025 11:43 AM", message: "Report generation started", type: "info" },
      { timestamp: "Apr 5, 2025 11:44 AM", message: "Collecting survey data", type: "info" },
      { timestamp: "Apr 5, 2025 11:45 AM", message: "Report generation completed successfully", type: "success" }
    ]
  };

  // For failed report example
  const failedReport: FailedReport = {
    id: "3",
    name: "Custom eNPS Analysis",
    type: "Custom",
    source: "eNPS Metrics",
    dateRange: "Feb 1 - May 1, 2025",
    created: "May 10, 2025 09:15 AM",
    status: "Failed",
    formats: ["pdf", "csv"],
    generationLogs: [
      { timestamp: "May 10, 2025 09:12 AM", message: "Report generation started", type: "info" },
      { timestamp: "May 10, 2025 09:14 AM", message: "Error: Unable to access survey data", type: "error" },
      { timestamp: "May 10, 2025 09:15 AM", message: "Report generation failed", type: "error" }
    ]
  };

  // Use failed report if ID matches
  const report: ReportType = reportId === "3" ? failedReport : mockReport;

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleDownload = (format) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Download started",
        description: `Your ${format.toUpperCase()} report is being downloaded.`,
      });
    }, 1500);
  };
  
  const handleRetryGeneration = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Report generation restarted",
        description: "We're generating your report again. This may take a few minutes.",
      });
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="mb-6">
          <Link to="/reports" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{report.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusBadgeVariant(report.status)}>
                  {report.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created: {report.created}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {report.status === 'Complete' ? (
                <>
                  {report.formats.includes('pdf') && (
                    <Button onClick={() => handleDownload('pdf')} disabled={isLoading}>
                      <File className="mr-2 h-4 w-4" />
                      {isLoading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                  )}
                  
                  {report.formats.includes('csv') && (
                    <Button variant="outline" onClick={() => handleDownload('csv')} disabled={isLoading}>
                      <FileText className="mr-2 h-4 w-4" />
                      {isLoading ? 'Downloading...' : 'Download CSV'}
                    </Button>
                  )}
                </>
              ) : report.status === 'Failed' ? (
                <Button onClick={handleRetryGeneration} disabled={isLoading}>
                  {isLoading ? 'Regenerating...' : 'Retry Generation'}
                </Button>
              ) : (
                <Button disabled>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </Button>
              )}
              
              <Button variant="outline" asChild>
                <Link to={`/reports/${reportId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Report
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Report details */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <p>{report.type}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <p>{report.source}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Date Range</span>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {report.dateRange}
                  </p>
                </div>
                
                {report.status === 'Complete' && 'fileSize' in report && report.fileSize && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">File Size</span>
                    <div className="space-y-1">
                      {report.formats.includes('pdf') && report.fileSize.pdf && (
                        <p>PDF: {report.fileSize.pdf}</p>
                      )}
                      {report.formats.includes('csv') && report.fileSize.csv && (
                        <p>CSV: {report.fileSize.csv}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {report.status === 'Pending' && (
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Generation Progress</span>
                    <Progress value={45} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">Estimated time remaining: 2 minutes</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Generation Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.generationLogs.map((log, index) => (
                    <div key={index} className="text-sm border-l-2 pl-3 py-1 border-muted">
                      {log.type === 'error' ? (
                        <div className="border-l-destructive text-destructive">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium">{log.message}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{log.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{log.timestamp}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column: Preview */}
          <div className="md:col-span-2">
            {report.status === 'Complete' ? (
              <ReportPreview 
                reportId={report.id || ''} 
                formats={report.formats} 
                onDownload={handleDownload} 
              />
            ) : report.status === 'Failed' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Generation Failed</CardTitle>
                  <CardDescription>The report generation encountered errors.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-12 text-center">
                  <div>
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Report Generation Failed</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      We couldn't generate this report due to an error. Please review the generation logs and try again.
                    </p>
                    <Button className="mt-6" onClick={handleRetryGeneration} disabled={isLoading}>
                      {isLoading ? 'Regenerating...' : 'Retry Generation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Report in Progress</CardTitle>
                  <CardDescription>Your report is being generated.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-12 text-center">
                  <div>
                    <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium">Generating Report</h3>
                    <p className="text-muted-foreground mt-2">
                      This may take a few minutes depending on the amount of data being processed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportDetail;
