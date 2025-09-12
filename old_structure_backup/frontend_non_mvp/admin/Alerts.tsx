import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Bell, 
  Settings, 
  TrendingDown, 
  TrendingUp,
  Users,
  Target,
  Activity,
  Shield,
  Mail,
  Slack,
  FileText,
  Eye,
  EyeOff,
  XCircle,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Severity = "High" | "Medium" | "Low";
type Status = "Open" | "In Review" | "Resolved";
type AlertType = "score_threshold" | "score_drop" | "participation" | "custom";

interface AlertItem {
  alert_id: string;
  team_id: string;
  team_name: string;
  driver: string;
  current_score: number;
  change: number;
  severity: Severity;
  status: Status;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  triggered_on: string;
}

interface ThresholdRule {
  id: string;
  name: string;
  type: AlertType;
  enabled: boolean;
  conditions: {
    driver_score_below?: number;
    score_drop_above?: number;
    participation_below?: number;
    custom_condition?: string;
  };
}

const Alerts = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ThresholdRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<ThresholdRule>>({
    name: "",
    type: "score_threshold",
    enabled: true,
    conditions: {}
  });

  // Mock data for alert summary
  const alertSummary = {
    activeAlerts: 7,
    resolvedAlerts: 23,
    avgResolutionTime: 4.2,
    thresholdsActive: 5
  };

  // Mock active alerts data
  const activeAlerts: AlertItem[] = useMemo(() => [
    {
      alert_id: "alrt_001",
      team_id: "sales_team",
      team_name: "Sales",
      driver: "Collaboration",
      current_score: 5.2,
      change: -1.3,
      severity: "High",
      status: "Open",
      created_at: "2025-01-15T10:30:00Z",
      triggered_on: "Jan 15"
    },
    {
      alert_id: "alrt_002",
      team_id: "marketing_team",
      team_name: "Marketing",
      driver: "Recognition",
      current_score: 6.1,
      change: -0.8,
      severity: "Medium",
      status: "In Review",
      created_at: "2025-01-14T14:20:00Z",
      triggered_on: "Jan 14"
    },
    {
      alert_id: "alrt_003",
      team_id: "engineering_team",
      team_name: "Engineering",
      driver: "Work-Life Balance",
      current_score: 4.8,
      change: -1.5,
      severity: "High",
      status: "Open",
      created_at: "2025-01-13T09:15:00Z",
      triggered_on: "Jan 13"
    },
    {
      alert_id: "alrt_004",
      team_id: "hr_team",
      team_name: "HR",
      driver: "Career Growth",
      current_score: 5.9,
      change: -0.6,
      severity: "Medium",
      status: "In Review",
      created_at: "2025-01-12T16:45:00Z",
      triggered_on: "Jan 12"
    },
    {
      alert_id: "alrt_005",
      team_id: "finance_team",
      team_name: "Finance",
      driver: "Communication",
      current_score: 6.5,
      change: -0.4,
      severity: "Low",
      status: "Open",
      created_at: "2025-01-11T11:30:00Z",
      triggered_on: "Jan 11"
    }
  ], []);

  // Mock resolved alerts data
  const resolvedAlerts: AlertItem[] = useMemo(() => [
    {
      alert_id: "alrt_006",
      team_id: "operations_team",
      team_name: "Operations",
      driver: "Team Collaboration",
      current_score: 7.2,
      change: 0.8,
      severity: "Medium",
      status: "Resolved",
      created_at: "2025-01-10T08:20:00Z",
      resolved_at: "2025-01-12T15:30:00Z",
      resolved_by: "Admin",
      triggered_on: "Jan 10"
    },
    {
      alert_id: "alrt_007",
      team_id: "support_team",
      team_name: "Support",
      driver: "Job Satisfaction",
      current_score: 6.8,
      change: 0.5,
      severity: "Low",
      status: "Resolved",
      created_at: "2025-01-09T13:45:00Z",
      resolved_at: "2025-01-11T10:15:00Z",
      resolved_by: "Admin",
      triggered_on: "Jan 9"
    }
  ], []);

  // Mock threshold rules
  const [thresholdRules, setThresholdRules] = useState<ThresholdRule[]>([
    {
      id: "thresh_001",
      name: "Low Driver Scores",
      type: "score_threshold",
      enabled: true,
      conditions: { driver_score_below: 6.0 }
    },
    {
      id: "thresh_002",
      name: "Significant Score Drops",
      type: "score_drop",
      enabled: true,
      conditions: { score_drop_above: 1.0 }
    },
    {
      id: "thresh_003",
      name: "Low Participation",
      type: "participation",
      enabled: true,
      conditions: { participation_below: 60 }
    },
    {
      id: "thresh_004",
      name: "Custom Rule",
      type: "custom",
      enabled: false,
      conditions: { custom_condition: "Any team with 3+ negative comments" }
    }
  ]);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Open": return "bg-red-100 text-red-700 border-red-200";
      case "In Review": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Resolved": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getChangeIcon = (change: number) => {
    return change < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
  };

  const getChangeColor = (change: number) => {
    return change < 0 ? "text-red-600" : "text-green-600";
  };

  const filteredActiveAlerts = activeAlerts.filter(alert => {
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
    if (teamFilter !== "all" && alert.team_name !== teamFilter) return false;
    return true;
  });

  const filteredResolvedAlerts = resolvedAlerts.filter(alert => {
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
    if (teamFilter !== "all" && alert.team_name !== teamFilter) return false;
    return true;
  });

  const handleAcknowledge = (alertId: string) => {
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been marked as in review",
    });
  };

  const handleResolve = (alertId: string) => {
    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Alert report has been downloaded as PDF",
    });
  };

  const handleNotifyManagers = () => {
    setShowNotificationModal(true);
  };

  const handleThresholdToggle = (ruleId: string) => {
    setThresholdRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast({
      title: "Threshold Updated",
      description: "Alert threshold has been updated successfully",
    });
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.conditions) {
      const rule: ThresholdRule = {
        id: `thresh_${Date.now()}`,
        name: newRule.name,
        type: newRule.type as AlertType,
        enabled: newRule.enabled || true,
        conditions: newRule.conditions
      };
      setThresholdRules(prev => [...prev, rule]);
      setNewRule({
        name: "",
        type: "score_threshold",
        enabled: true,
        conditions: {}
      });
      setShowAddRuleModal(false);
      toast({
        title: "Rule Added",
        description: "New alert threshold rule has been added successfully",
      });
    }
  };

  const handleEditRule = (rule: ThresholdRule) => {
    setSelectedRule(rule);
    setShowEditRuleModal(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setThresholdRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule Deleted",
      description: "Alert threshold rule has been deleted successfully",
    });
  };

  const handleUpdateRule = () => {
    if (selectedRule) {
      setThresholdRules(prev => prev.map(rule => 
        rule.id === selectedRule.id ? selectedRule : rule
      ));
      setShowEditRuleModal(false);
      setSelectedRule(null);
      toast({
        title: "Rule Updated",
        description: "Alert threshold rule has been updated successfully",
      });
    }
  };

  const handleTeamClick = (teamName: string) => {
    setTeamFilter(teamName);
    toast({
      title: "Team Filter Applied",
      description: `Filtering alerts for ${teamName} team`,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Alert Management Board with Filters */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <AlertTriangle className="w-6 h-6 text-gray-700" />
                Alert Management
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Fire alarm system for company pulse monitoring
              </CardDescription>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-gray-200 bg-white/50 backdrop-blur-sm"
                onClick={handleDownloadReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleNotifyManagers}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify Managers
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  {alertSummary.activeAlerts > 0 && (
                    <Badge className="bg-red-100 text-red-700 border-red-200">!</Badge>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{alertSummary.activeAlerts}</p>
                  <p className="text-sm text-gray-600">Active Alerts</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">+15%</Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{alertSummary.resolvedAlerts}</p>
                  <p className="text-sm text-gray-600">Resolved (30d)</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">-8%</Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{alertSummary.avgResolutionTime} days</p>
                  <p className="text-sm text-gray-600">Avg Resolution</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">+2</Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{alertSummary.thresholdsActive}</p>
                  <p className="text-sm text-gray-600">Thresholds Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Team</Label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="h-10 border-gray-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList className="bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="active" className="rounded-md">Active Alerts</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-md">Alert History</TabsTrigger>
                </TabsList>
                <div className="text-sm text-gray-500">
                  {activeTab === "active" ? filteredActiveAlerts.length : filteredResolvedAlerts.length} alerts
                </div>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="active" className="mt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Severity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric/Driver</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Score Change</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Triggered On</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActiveAlerts.map((alert) => (
                        <tr key={alert.alert_id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <Badge className={`${getSeverityColor(alert.severity)} border`}>
                              {alert.severity}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                              onClick={() => handleTeamClick(alert.team_name)}
                            >
                              {alert.team_name}
                            </Button>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">{alert.driver}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${getChangeColor(alert.change)}`}>
                                {alert.change > 0 ? '+' : ''}{alert.change.toFixed(1)}
                              </span>
                              {getChangeIcon(alert.change)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{alert.triggered_on}</td>
                          <td className="py-4 px-4">
                            <Badge className={`${getStatusColor(alert.status)} border`}>
                              {alert.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {alert.status === "Open" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAcknowledge(alert.alert_id)}
                                >
                                  Acknowledge
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleResolve(alert.alert_id)}
                              >
                                Resolve
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredActiveAlerts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">No active alerts</p>
                      <p className="text-gray-400 text-sm mt-1">All systems are running smoothly</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Severity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric/Driver</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Score Change</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Triggered On</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Resolved On</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Resolved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResolvedAlerts.map((alert) => (
                        <tr key={alert.alert_id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <Badge className={`${getSeverityColor(alert.severity)} border`}>
                              {alert.severity}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">{alert.team_name}</td>
                          <td className="py-4 px-4 font-medium text-gray-900">{alert.driver}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${getChangeColor(alert.change)}`}>
                                {alert.change > 0 ? '+' : ''}{alert.change.toFixed(1)}
                              </span>
                              {getChangeIcon(alert.change)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{alert.triggered_on}</td>
                          <td className="py-4 px-4 text-gray-600">
                            {alert.resolved_at ? new Date(alert.resolved_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-4 px-4 text-gray-600">{alert.resolved_by || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredResolvedAlerts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">No resolved alerts</p>
                      <p className="text-gray-400 text-sm mt-1">No alerts have been resolved yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      {/* Threshold Configuration */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 mb-2 text-xl font-bold text-gray-900">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-700" />
                  </div>
                  Threshold Configuration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Define rules that trigger alerts automatically
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                className="border-gray-200 bg-white/50 backdrop-blur-sm"
                onClick={() => setShowAddRuleModal(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
                          <div className="space-y-4">
                {thresholdRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-2xl hover:shadow-xl hover:border-blue-300 transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 shadow-lg border-2 ${
                          rule.enabled 
                            ? 'bg-green-500 border-green-600' 
                            : 'bg-gray-300 border-gray-400'
                        }`} onClick={() => handleThresholdToggle(rule.id)}>
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${
                            rule.enabled ? 'translate-x-8' : 'translate-x-0'
                          }`}>
                            {rule.enabled && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{rule.name}</h3>
                        <p className="text-sm text-gray-600">
                          {rule.type === "score_threshold" && `Alert when any driver score < ${rule.conditions.driver_score_below}`}
                          {rule.type === "score_drop" && `Alert when score drops > ${rule.conditions.score_drop_above}`}
                          {rule.type === "participation" && `Alert when participation < ${rule.conditions.participation_below}%`}
                          {rule.type === "custom" && rule.conditions.custom_condition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`px-4 py-2 text-sm font-semibold border-2 ${
                        rule.enabled 
                          ? "bg-green-100 text-green-700 border-green-300" 
                          : "bg-gray-100 text-gray-600 border-gray-300"
                      }`}>
                        {rule.enabled ? "✓ Active" : "○ Inactive"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-300 hover:border-red-400 hover:bg-red-50"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 mb-2 text-xl font-bold text-gray-900">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-700" />
                </div>
                Download Alert Report
              </CardTitle>
              <CardDescription className="text-gray-600">
                Generate a comprehensive PDF report of all active alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleDownloadReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 mb-2 text-xl font-bold text-gray-900">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-700" />
                </div>
                Notify Managers
              </CardTitle>
              <CardDescription className="text-gray-600">
                Send automated notifications to team managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleNotifyManagers}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email Notifications
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleNotifyManagers}
                >
                  <Slack className="w-4 h-4 mr-2" />
                  Send Slack Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Notification Modal */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notify Managers
            </DialogTitle>
            <DialogDescription>
              Send notifications to team managers about active alerts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent - Immediate Action Required</SelectItem>
                  <SelectItem value="standard">Standard Alert Notification</SelectItem>
                  <SelectItem value="summary">Weekly Alert Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNotificationModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Notifications Sent",
                  description: "Managers have been notified about active alerts",
                });
                setShowNotificationModal(false);
              }}>
                Send Notifications
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Rule Modal */}
      <Dialog open={showAddRuleModal} onOpenChange={setShowAddRuleModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add New Alert Rule
            </DialogTitle>
            <DialogDescription>
              Create a new alert threshold rule to monitor specific conditions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                placeholder="e.g., Low Team Morale Alert"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Rule Type</Label>
              <Select 
                value={newRule.type} 
                onValueChange={(value) => setNewRule(prev => ({ ...prev, type: value as AlertType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score_threshold">Score Threshold</SelectItem>
                  <SelectItem value="score_drop">Score Drop</SelectItem>
                  <SelectItem value="participation">Participation Rate</SelectItem>
                  <SelectItem value="custom">Custom Rule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Conditions</Label>
              {newRule.type === "score_threshold" && (
                <div className="space-y-2">
                  <Label className="text-sm">Alert when any driver score is below:</Label>
                  <Input
                    type="number"
                    placeholder="6.0"
                    onChange={(e) => setNewRule(prev => ({ 
                      ...prev, 
                      conditions: { ...prev.conditions, driver_score_below: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
              )}
              {newRule.type === "score_drop" && (
                <div className="space-y-2">
                  <Label className="text-sm">Alert when score drops by more than:</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    onChange={(e) => setNewRule(prev => ({ 
                      ...prev, 
                      conditions: { ...prev.conditions, score_drop_above: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
              )}
              {newRule.type === "participation" && (
                <div className="space-y-2">
                  <Label className="text-sm">Alert when participation rate is below:</Label>
                  <Input
                    type="number"
                    placeholder="60"
                    onChange={(e) => setNewRule(prev => ({ 
                      ...prev, 
                      conditions: { ...prev.conditions, participation_below: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              )}
              {newRule.type === "custom" && (
                <div className="space-y-2">
                  <Label className="text-sm">Custom condition description:</Label>
                  <Input
                    placeholder="e.g., Any team with 3+ negative comments"
                    onChange={(e) => setNewRule(prev => ({ 
                      ...prev, 
                      conditions: { ...prev.conditions, custom_condition: e.target.value }
                    }))}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newRule.enabled}
                onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, enabled: checked }))}
              />
              <Label>Enable rule immediately</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddRuleModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule} disabled={!newRule.name}>
                Add Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Modal */}
      <Dialog open={showEditRuleModal} onOpenChange={setShowEditRuleModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Edit Alert Rule
            </DialogTitle>
            <DialogDescription>
              Modify the selected alert threshold rule
            </DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={selectedRule.name}
                  onChange={(e) => setSelectedRule(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select 
                  value={selectedRule.type} 
                  onValueChange={(value) => setSelectedRule(prev => prev ? { ...prev, type: value as AlertType } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score_threshold">Score Threshold</SelectItem>
                    <SelectItem value="score_drop">Score Drop</SelectItem>
                    <SelectItem value="participation">Participation Rate</SelectItem>
                    <SelectItem value="custom">Custom Rule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Conditions</Label>
                {selectedRule.type === "score_threshold" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Alert when any driver score is below:</Label>
                    <Input
                      type="number"
                      value={selectedRule.conditions.driver_score_below || ""}
                      onChange={(e) => setSelectedRule(prev => prev ? { 
                        ...prev, 
                        conditions: { ...prev.conditions, driver_score_below: parseFloat(e.target.value) }
                      } : null)}
                    />
                  </div>
                )}
                {selectedRule.type === "score_drop" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Alert when score drops by more than:</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedRule.conditions.score_drop_above || ""}
                      onChange={(e) => setSelectedRule(prev => prev ? { 
                        ...prev, 
                        conditions: { ...prev.conditions, score_drop_above: parseFloat(e.target.value) }
                      } : null)}
                    />
                  </div>
                )}
                {selectedRule.type === "participation" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Alert when participation rate is below:</Label>
                    <Input
                      type="number"
                      value={selectedRule.conditions.participation_below || ""}
                      onChange={(e) => setSelectedRule(prev => prev ? { 
                        ...prev, 
                        conditions: { ...prev.conditions, participation_below: parseInt(e.target.value) }
                      } : null)}
                    />
                  </div>
                )}
                {selectedRule.type === "custom" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Custom condition description:</Label>
                    <Input
                      value={selectedRule.conditions.custom_condition || ""}
                      onChange={(e) => setSelectedRule(prev => prev ? { 
                        ...prev, 
                        conditions: { ...prev.conditions, custom_condition: e.target.value }
                      } : null)}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedRule.enabled}
                  onCheckedChange={(checked) => setSelectedRule(prev => prev ? { ...prev, enabled: checked } : null)}
                />
                <Label>Enable rule</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditRuleModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRule}>
                  Update Rule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alerts;


