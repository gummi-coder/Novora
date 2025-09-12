import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  RefreshCw,
  Mail, 
  Bug, 
  AlertCircle, 
  MessageSquare,
  CheckCircle,
  Clock,
  X,
  Bell,
  CheckCircle2,
  Info,
  XCircle,
  Filter,
  User,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alertService, Alert, AlertStats } from "@/services/alertService";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SystemAlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    type: "",
    priority: "",
    search: "",
  });
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertService.getAlerts(filters);
      setAlerts(response.alerts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await alertService.getAlertStats();
      setStats(stats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch alert statistics",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [filters]);

  const handleAcknowledge = async (id: number) => {
    try {
      await alertService.acknowledgeAlert(id);
      toast({
        title: "Success",
        description: "Alert acknowledged successfully",
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await alertService.resolveAlert(id);
      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Alert["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>;
      case "acknowledged":
        return <Badge variant="warning">Acknowledged</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
    }
  };

  const getPriorityBadge = (priority: Alert["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "critical":
        return <Badge variant="destructive" className="bg-red-600">Critical</Badge>;
    }
  };

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "info":
        return <Info className="h-4 w-4 text-info" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filters.type === 'all' || alert.type === filters.type;
    const matchesStatus = filters.status === 'all' || alert.status === filters.status;
    const matchesPriority = filters.priority === 'all' || alert.priority === filters.priority;
    const matchesSearch = alert.message.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and manage system alerts and notifications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active || 0} active alerts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats?.active || 0) / (stats?.total || 1) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Alerts</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.resolved || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats?.resolved || 0) / (stats?.total || 1) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged Alerts</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.acknowledged || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats?.acknowledged || 0) / (stats?.total || 1) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters({ ...filters, priority: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{alert.title}</TableCell>
                    <TableCell>{alert.source}</TableCell>
                    <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell>
                      {new Date(alert.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {alert.status === "active" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleAcknowledge(alert.id)}
                              >
                                Acknowledge
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleResolve(alert.id)}
                              >
                                Resolve
                              </DropdownMenuItem>
                            </>
                          )}
                          {alert.status === "acknowledged" && (
                            <DropdownMenuItem
                              onClick={() => handleResolve(alert.id)}
                            >
                              Resolve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Alerts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byType.map((type) => (
                <div key={type.type} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm capitalize">{type.type}</span>
                    <span className="text-sm font-medium">{type.count}</span>
                  </div>
                  <Progress
                    value={(type.count / (stats?.total || 1)) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Alerts by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byPriority.map((priority) => (
                <div key={priority.priority} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm capitalize">{priority.priority}</span>
                    <span className="text-sm font-medium">{priority.count}</span>
                  </div>
                  <Progress
                    value={(priority.count / (stats?.total || 1)) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemAlertsPage;
