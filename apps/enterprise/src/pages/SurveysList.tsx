
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Filter, Plus, Edit, Copy, Trash2, ArrowUp, ArrowDown, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";

// Define survey types
interface Survey {
  id: string;
  title: string;
  status: "Draft" | "Scheduled" | "Live" | "Closed";
  created: string;
  scheduled: string;
  responseRate: number;
}

// Mock data for surveys
const mockSurveys = [
  {
    id: "1",
    title: "Q2 Employee Satisfaction",
    status: "Live",
    created: "2025-04-12",
    scheduled: "2025-04-15",
    responseRate: 68,
  },
  {
    id: "2",
    title: "Manager Feedback",
    status: "Draft",
    created: "2025-05-01",
    scheduled: "",
    responseRate: 0,
  },
  {
    id: "3",
    title: "Remote Work Assessment",
    status: "Closed",
    created: "2025-03-10",
    scheduled: "2025-03-15",
    responseRate: 92,
  },
  {
    id: "4",
    title: "Onboarding Experience",
    status: "Scheduled",
    created: "2025-05-05",
    scheduled: "2025-05-20",
    responseRate: 0,
  },
  {
    id: "5",
    title: "Team Culture Survey",
    status: "Live",
    created: "2025-04-28",
    scheduled: "2025-05-01",
    responseRate: 43,
  },
];

const SurveysList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  // Items per page
  const itemsPerPage = 10;

  // Filter and sort surveys
  const processedSurveys = mockSurveys
    .filter(survey => {
      const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || survey.status === statusFilter;
      
      // Date filter
      let matchesDateRange = true;
      if (dateFrom) {
        const createdDate = new Date(survey.created);
        matchesDateRange = matchesDateRange && createdDate >= dateFrom;
      }
      if (dateTo) {
        const createdDate = new Date(survey.created);
        matchesDateRange = matchesDateRange && createdDate <= dateTo;
      }
      
      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      
      switch (sortBy) {
        case 'title':
          return sortDirection === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case 'created':
          return sortDirection === 'asc' 
            ? new Date(a.created).getTime() - new Date(b.created).getTime()
            : new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'responseRate':
          return sortDirection === 'asc' 
            ? a.responseRate - b.responseRate
            : b.responseRate - a.responseRate;
        default:
          return 0;
      }
    });

  // Paginate surveys
  const totalPages = Math.ceil(processedSurveys.length / itemsPerPage);
  const paginatedSurveys = processedSurveys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteSurvey = () => {
    toast.success(`Survey deleted successfully`);
    setShowDeleteDialog(false);
    setSurveyToDelete(null);
  };

  const handleDuplicateSurvey = (id: string) => {
    toast.success(`Survey duplicated successfully`);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-green-500 hover:bg-green-600";
      case "Draft":
        return "bg-gray-500 hover:bg-gray-600";
      case "Closed":
        return "bg-red-500 hover:bg-red-600";
      case "Scheduled":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 inline ml-1" /> 
      : <ArrowDown className="h-4 w-4 inline ml-1" />;
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Surveys</h1>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="w-full md:w-auto" asChild>
              <Link to="/surveys/new">
                <Plus className="h-4 w-4 mr-2" /> New Survey
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Surveys</CardTitle>
            <CardDescription>
              Manage your company's surveys and view results
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search surveys..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Live">Live</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date range filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFrom && dateTo ? (
                        <>
                          {format(dateFrom, "MMM d")} - {format(dateTo, "MMM d, yyyy")}
                        </>
                      ) : (
                        <span>Date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">From</h4>
                        <CalendarComponent
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">To</h4>
                        <CalendarComponent
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setDateFrom(undefined);
                            setDateTo(undefined);
                          }}
                        >
                          Clear
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Close the popover (would need a ref to popover in a real implementation)
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      Title {renderSortIcon('title')}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead 
                      className="hidden md:table-cell cursor-pointer"
                      onClick={() => handleSort('created')}
                    >
                      Created {renderSortIcon('created')}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Scheduled</TableHead>
                    <TableHead 
                      className="hidden md:table-cell cursor-pointer"
                      onClick={() => handleSort('responseRate')}
                    >
                      Response Rate {renderSortIcon('responseRate')}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSurveys.length > 0 ? (
                    paginatedSurveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell className="font-medium">{survey.title}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            className={`${getStatusColor(survey.status)} text-white`}
                          >
                            {survey.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{survey.created}</TableCell>
                        <TableCell className="hidden md:table-cell">{survey.scheduled || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {survey.status === "Draft" || survey.status === "Scheduled"
                            ? "—"
                            : `${survey.responseRate}%`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="View Results"
                              asChild
                            >
                              <Link to={`/surveys/${survey.id}`}>
                                <Search className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="Edit Survey"
                              asChild
                            >
                              <Link to={`/surveys/${survey.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="Duplicate Survey"
                              onClick={() => handleDuplicateSurvey(survey.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive" 
                              title="Delete Survey"
                              onClick={() => {
                                setSurveyToDelete(survey.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No surveys found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {processedSurveys.length > 0 && totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        href="#" 
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          href="#"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        href="#" 
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Survey</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this survey? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSurvey}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SurveysList;
