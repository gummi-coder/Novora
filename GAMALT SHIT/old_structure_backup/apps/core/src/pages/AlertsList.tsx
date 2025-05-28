
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertTable, Alert } from "@/components/alerts/AlertTable";
import { AlertCard } from "@/components/alerts/AlertCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, SlidersHorizontal } from "lucide-react";

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Sales team eNPS dropped 20%",
    metric: "eNPS",
    triggeredOn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    severity: "critical",
    status: "unread",
    value: -5,
    previousValue: 15,
    percentageChange: -20
  },
  {
    id: "2",
    title: "Engineering response rate below 50%",
    metric: "Response Rate",
    triggeredOn: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    severity: "warning",
    status: "unread",
    value: 48,
    previousValue: 75,
    percentageChange: -27
  },
  {
    id: "3",
    title: "Manager satisfaction score decreased",
    metric: "Job Satisfaction",
    triggeredOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    severity: "info",
    status: "acknowledged",
    value: 3.5,
    previousValue: 4.2,
    percentageChange: -17
  },
  {
    id: "4",
    title: "Product team collaboration score improved",
    metric: "Collaboration",
    triggeredOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    severity: "info",
    status: "resolved",
    value: 4.2,
    previousValue: 3.8,
    percentageChange: 10
  }
];

export default function AlertsList() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    metric: "all",
    severity: "all",
    status: "all",
    dateRange: "all",
  });
  
  // Apply filters when they change
  useEffect(() => {
    let result = alerts;
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(alert => 
        alert.title.toLowerCase().includes(searchLower) || 
        alert.metric.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply metric filter
    if (filters.metric !== "all") {
      result = result.filter(alert => alert.metric === filters.metric);
    }
    
    // Apply severity filter
    if (filters.severity !== "all") {
      result = result.filter(alert => alert.severity === filters.severity);
    }
    
    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter(alert => alert.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let cutoff = new Date();
      
      switch (filters.dateRange) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      result = result.filter(alert => new Date(alert.triggeredOn) >= cutoff);
    }
    
    setFilteredAlerts(result);
  }, [filters, alerts]);
  
  // Handle acknowledge alert
  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: "acknowledged" } : alert
    ));
  };
  
  // Handle resolve alert
  const handleResolve = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: "resolved" } : alert
    ));
  };
  
  // Handle mark all as read
  const handleMarkAllRead = () => {
    setAlerts(alerts.map(alert => 
      alert.status === "unread" ? { ...alert, status: "acknowledged" } : alert
    ));
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };
  
  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: "",
      metric: "all",
      severity: "all",
      status: "all",
      dateRange: "all",
    });
  };
  
  // Apply filters and close dialog
  const applyFilters = () => {
    setIsFilterDialogOpen(false);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Alerts Center</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={viewMode === "table" ? "bg-accent" : ""}
              onClick={() => setViewMode("table")}
            >
              Table
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={viewMode === "cards" ? "bg-accent" : ""}
              onClick={() => setViewMode("cards")}
            >
              Cards
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              className="pl-8"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
            
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {viewMode === "table" ? (
          <AlertTable 
            alerts={filteredAlerts} 
            onAcknowledge={handleAcknowledge} 
            onResolve={handleResolve}
            onMarkAllRead={handleMarkAllRead}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No alerts found</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))
            )}
          </div>
        )}
        
        {filteredAlerts.length > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </p>
            <Button variant="outline" size="sm" onClick={() => {}} disabled>
              Load more
            </Button>
          </div>
        )}
      </div>
      
      {/* Filters Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Alerts</DialogTitle>
            <DialogDescription>
              Select filters to narrow down alerts
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Metric</label>
              <Select
                value={filters.metric}
                onValueChange={(value) => handleFilterChange("metric", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All metrics</SelectItem>
                  <SelectItem value="eNPS">eNPS</SelectItem>
                  <SelectItem value="Response Rate">Response Rate</SelectItem>
                  <SelectItem value="Job Satisfaction">Job Satisfaction</SelectItem>
                  <SelectItem value="Collaboration">Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={filters.severity}
                onValueChange={(value) => handleFilterChange("severity", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={clearAllFilters}>Clear all</Button>
            <Button onClick={applyFilters}>Apply filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
