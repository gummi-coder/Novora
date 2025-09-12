import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Settings,
  Download,
  Search,
  Filter,
  BellRing,
  MessageSquare,
  Users,
  Zap,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Alert {
  id: string;
  timestamp: string;
  ruleName: string;
  component: string;
  severity: "critical" | "warning" | "info";
  status: "open" | "acknowledged" | "resolved";
  description: string;
  assignee?: string;
  comments: number;
  timeToAcknowledge?: number;
  timeToResolve?: number;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: "critical" | "warning" | "info";
  lastFired: string;
  enabled: boolean;
  notificationChannels: string[];
  autoResolve: boolean;
  autoResolveAfter: number;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: "email" | "slack" | "pagerduty" | "webhook";
  endpoint: string;
  enabled: boolean;
}

const AlertsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        // Mock data for now
        setAlerts([
          {
            id: "ALT-001",
            timestamp: "2024-03-18T10:30:00",
            ruleName: "High CPU Usage",
            component: "Web Server",
            severity: "critical",
            status: "open",
            description: "CPU usage exceeded 90% for 5 minutes",
            comments: 3,
          },
          {
            id: "ALT-002",
            timestamp: "2024-03-18T09:15:00",
            ruleName: "Memory Warning",
            component: "Database",
            severity: "warning",
            status: "acknowledged",
            description: "Memory usage above 80%",
            assignee: "John Doe",
            comments: 1,
            timeToAcknowledge: 15,
          },
        ]);

        setRules([
          {
            id: "RULE-001",
            name: "High CPU Usage",
            condition: "CPU > 90% for 5m",
            severity: "critical",
            lastFired: "2024-03-18T10:30:00",
            enabled: true,
            notificationChannels: ["email", "slack"],
            autoResolve: true,
            autoResolveAfter: 10,
          },
        ]);

        setChannels([
          {
            id: "CH-001",
            name: "Engineering Team",
            type: "slack",
            endpoint: "#alerts-engineering",
            enabled: true,
          },
        ]);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  const getSeverityBadge = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      case "info":
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getStatusBadge = (status: Alert["status"]) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>;
      case "acknowledged":
        return <Badge variant="warning">Acknowledged</Badge>;
      case "resolved":
        return <Badge variant="success">Resolved</Badge>;
    }
  };

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
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.status === "open").length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === "critical").length} critical
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Acknowledge</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15m</div>
            <p className="text-xs text-muted-foreground">
              -5m from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Resolve</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45m</div>
            <p className="text-xs text-muted-foreground">
              -10m from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              {rules.filter(r => r.enabled).length} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Alert Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Alert volume chart will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Critical</span>
                      <span className="text-sm font-medium">
                        {alerts.filter(a => a.severity === "critical").length}
                      </span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Warning</span>
                      <span className="text-sm font-medium">
                        {alerts.filter(a => a.severity === "warning").length}
                      </span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Info</span>
                      <span className="text-sm font-medium">
                        {alerts.filter(a => a.severity === "info").length}
                      </span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{alert.ruleName}</TableCell>
                      <TableCell>{alert.component}</TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Acknowledge</DropdownMenuItem>
                            <DropdownMenuItem>Resolve</DropdownMenuItem>
                            <DropdownMenuItem>Assign</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Alert Rules</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Last Fired</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                      <TableCell>{new Date(rule.lastFired).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={rule.enabled ? "success" : "secondary"}>
                          {rule.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Active Alerts</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Alert
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{alert.ruleName}</TableCell>
                      <TableCell>{alert.component}</TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>{alert.assignee || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Alert History</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Alert Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Alert heatmap will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Alert Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{rule.name}</span>
                        <span className="text-sm font-medium">24 alerts</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time to Resolve</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{alert.ruleName}</TableCell>
                      <TableCell>{alert.component}</TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>{alert.timeToResolve ? `${alert.timeToResolve}m` : "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notification Channels</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Channel
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground">{channel.endpoint}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Test
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escalation Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Level 1</span>
                      <span className="text-sm font-medium">Engineering Team</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Notify after 5 minutes
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Level 2</span>
                      <span className="text-sm font-medium">SRE Team</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Notify after 15 minutes
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Level 3</span>
                      <span className="text-sm font-medium">On-Call Manager</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Notify after 30 minutes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-md">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Webhooks</p>
                    <p className="text-sm text-muted-foreground">3 configured</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-md">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Status Page</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-md">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">On-Call Schedule</p>
                    <p className="text-sm text-muted-foreground">Synced</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage; 