
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Edit, Trash2, File } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { ReportCard } from "@/components/reports/ReportCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ReportsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const { toast } = useToast();

  // Mock data for reports
  const mockReports = [
    {
      id: "1",
      name: "Q1 Engagement Summary",
      type: "Overall Summary",
      source: "All Surveys",
      dateRange: "Jan 1 - Mar 31, 2025",
      created: "Apr 5, 2025",
      status: "Complete",
      formats: ["pdf", "csv"]
    },
    {
      id: "2",
      name: "Engineering Department Report",
      type: "Department",
      source: "Engineering Surveys",
      dateRange: "Jan 1 - Jun 30, 2025",
      created: "Jul 5, 2025",
      status: "Pending",
      formats: ["pdf"]
    },
    {
      id: "3",
      name: "Custom eNPS Analysis",
      type: "Custom",
      source: "eNPS Metrics",
      dateRange: "Feb 1 - May 1, 2025",
      created: "May 10, 2025",
      status: "Failed",
      formats: ["csv"]
    },
    {
      id: "4",
      name: "Marketing Department Satisfaction",
      type: "Department",
      source: "Marketing Surveys",
      dateRange: "Mar 15 - Jun 15, 2025",
      created: "Jun 20, 2025",
      status: "Complete",
      formats: ["pdf", "csv"]
    },
    {
      id: "5",
      name: "Executive Team Report",
      type: "Custom",
      source: "Leadership Metrics",
      dateRange: "Jan 1 - Dec 31, 2024",
      created: "Jan 10, 2025",
      status: "Complete",
      formats: ["pdf"]
    },
    {
      id: "6",
      name: "Monthly Participation Analysis",
      type: "Custom",
      source: "Participation Metrics",
      dateRange: "Apr 1 - Apr 30, 2025",
      created: "May 5, 2025",
      scheduled: "Monthly",
      status: "Complete",
      formats: ["csv"]
    },
    {
      id: "7",
      name: "Quarterly Team Comparison",
      type: "Overall Summary",
      source: "All Surveys",
      dateRange: "Jan 1 - Mar 31, 2025",
      created: "Apr 2, 2025",
      scheduled: "Quarterly", 
      status: "Pending",
      formats: ["pdf"]
    },
  ];

  // Filter reports based on search query and filters
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || report.type.toLowerCase() === typeFilter.toLowerCase();
    
    // Date range filtering
    let matchesDateRange = true;
    if (dateRange.from && dateRange.to) {
      // In a real app, you would do proper date parsing and comparison
      // This is a simplified mock implementation
      matchesDateRange = true; // Just a placeholder
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  // Pagination
  const reportsPerPage = 5;
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  // Status badge color variants
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

  // Type badge icon
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'overall summary':
        return <File className="h-4 w-4 mr-1" />;
      case 'department':
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  // Delete handler
  const handleDelete = (reportId: string) => {
    // In a real app, you would call an API to delete the report
    toast({
      title: "Report deleted",
      description: `Report ${reportId} has been deleted successfully.`,
    });
    // Then refresh reports list
  };

  // Download handler
  const handleDownload = (reportId: string, format: string) => {
    // In a real app, you would call an API to download the report
    toast({
      title: "Downloading report",
      description: `Report ${reportId} is being downloaded in ${format.toUpperCase()} format.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <div className="flex gap-4">
            <Button onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} variant="outline">
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </Button>
            <Button asChild>
              <Link to="/reports/new">Create New Report</Link>
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="overall summary">Overall Summary</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <DateRangePicker 
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">Source</TableHead>
                      <TableHead className="hidden md:table-cell">Date Range</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReports.length > 0 ? (
                      paginatedReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getTypeIcon(report.type)}
                              <span>{report.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{report.source}</TableCell>
                          <TableCell className="hidden md:table-cell">{report.dateRange}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {report.created}
                            {report.scheduled && <div className="text-xs text-muted-foreground">({report.scheduled})</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(report.status)}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" asChild>
                                <Link to={`/reports/${report.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {report.status === 'Complete' && (
                                <Button variant="outline" size="icon" onClick={() => report.formats.includes('pdf') && handleDownload(report.id, 'pdf')}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="icon" asChild>
                                <Link to={`/reports/${report.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the report
                                      and remove it from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(report.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No reports found. Try adjusting your search or filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedReports.length > 0 ? (
                  paginatedReports.map(report => (
                    <ReportCard 
                      key={report.id} 
                      report={report} 
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    No reports found. Try adjusting your search or filters.
                  </div>
                )}
              </div>
            )}
            
            {filteredReports.length > reportsPerPage && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.max(1, p - 1));
                      }} 
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsList;
