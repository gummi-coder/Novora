import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Calendar,
  Clock,
  Users,
  Mail,
  Bell,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isAfter, isBefore } from "date-fns";
import {
  AutoPilotPlan,
  AutoPilotSurvey,
  AutoPilotMetrics,
  AutoPilotActivity,
  autoPilotService
} from "@/services/autoPilot";
import AutoPilotPlanBuilder from "./AutoPilotPlanBuilder";

interface AutoPilotDashboardProps {
  onNavigateToSurvey?: (surveyId: string) => void;
}

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({
  onNavigateToSurvey
}) => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<AutoPilotPlan[]>([]);
  const [surveys, setSurveys] = useState<AutoPilotSurvey[]>([]);
  const [metrics, setMetrics] = useState<AutoPilotMetrics | null>(null);
  const [activities, setActivities] = useState<AutoPilotActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AutoPilotPlan | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, surveysData, metricsData, activitiesData] = await Promise.all([
        autoPilotService.getPlans(),
        autoPilotService.getScheduledSurveys(),
        autoPilotService.getMetrics(),
        autoPilotService.getActivityLog(undefined, 10)
      ]);
      
      setPlans(plansData);
      setSurveys(surveysData);
      setMetrics(metricsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading auto-pilot data:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load auto-pilot data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (plan: AutoPilotPlan) => {
    try {
      const newPlan = await autoPilotService.createPlan(plan);
      setPlans(prev => [...prev, newPlan]);
      setShowCreateDialog(false);
      toast({
        title: "Plan Created",
        description: "Auto-pilot plan created successfully.",
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Create Failed",
        description: "Failed to create auto-pilot plan.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePlan = async (plan: AutoPilotPlan) => {
    if (!plan.id) return;
    
    try {
      const updatedPlan = await autoPilotService.updatePlan(plan.id, plan);
      setPlans(prev => prev.map(p => p.id === plan.id ? updatedPlan : p));
      setShowEditDialog(false);
      setSelectedPlan(null);
      toast({
        title: "Plan Updated",
        description: "Auto-pilot plan updated successfully.",
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update auto-pilot plan.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan?.id) return;
    
    try {
      await autoPilotService.deletePlan(selectedPlan.id);
      setPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
      setShowDeleteDialog(false);
      setSelectedPlan(null);
      toast({
        title: "Plan Deleted",
        description: "Auto-pilot plan deleted successfully.",
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete auto-pilot plan.",
        variant: "destructive"
      });
    }
  };

  const handleTogglePlanStatus = async (plan: AutoPilotPlan) => {
    try {
      let updatedPlan: AutoPilotPlan;
      if (plan.isActive) {
        updatedPlan = await autoPilotService.deactivatePlan(plan.id!);
      } else {
        updatedPlan = await autoPilotService.activatePlan(plan.id!);
      }
      
      setPlans(prev => prev.map(p => p.id === plan.id ? updatedPlan : p));
      toast({
        title: plan.isActive ? "Plan Paused" : "Plan Activated",
        description: `Auto-pilot plan ${plan.isActive ? 'paused' : 'activated'} successfully.`,
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Toggle Failed",
        description: "Failed to toggle plan status.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (plan: AutoPilotPlan) => {
    if (!plan.isActive) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    
    const now = new Date();
    if (plan.endDate && isAfter(now, plan.endDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (isBefore(now, plan.startDate)) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      daily: "Daily",
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
      quarterly: "Quarterly"
    };
    return labels[frequency] || frequency;
  };

  const getNextSurveyDate = (plan: AutoPilotPlan) => {
    const lastSurvey = surveys
      .filter(s => s.planId === plan.id)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0];
    
    if (lastSurvey) {
      return autoPilotService.calculateNextSurveyDate(plan, new Date(lastSurvey.scheduledDate));
    }
    
    return autoPilotService.calculateNextSurveyDate(plan);
  };

  const filteredPlans = plans.filter(plan => {
    if (filterStatus === 'active') return plan.isActive;
    if (filterStatus === 'inactive') return !plan.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auto-Pilot Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage automated survey sending with smart scheduling and reminders
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowMetricsDialog(true)}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Metrics</span>
          </Button>
          <Button
            variant="outline"
            onClick={loadData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalSurveys}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.activePlans} active plans
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageResponseRate}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalResponses} total responses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Survey</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.nextScheduledSurvey ? format(new Date(metrics.nextScheduledSurvey), "MMM d") : "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.nextScheduledSurvey ? format(new Date(metrics.nextScheduledSurvey), "h:mm a") : "No surveys scheduled"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activePlans}</div>
              <p className="text-xs text-muted-foreground">
                {plans.length - metrics.activePlans} paused
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All ({plans.length})
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Active ({plans.filter(p => p.isActive).length})
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('inactive')}
          >
            Paused ({plans.filter(p => !p.isActive).length})
          </Button>
        </div>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Pilot Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all' 
                  ? "Create your first auto-pilot plan to get started with automated surveys."
                  : `No ${filterStatus} plans found.`
                }
              </p>
              {filterStatus === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Plan
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Survey</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-500">{plan.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(plan)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{getFrequencyLabel(plan.frequency)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(getNextSurveyDate(plan), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(getNextSurveyDate(plan), "h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {plan.questionRotation ? "Rotating" : "Fixed"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {plan.reminderSettings.enabled 
                            ? `${plan.reminderSettings.maxReminders} max`
                            : "Disabled"
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlan(plan);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTogglePlanStatus(plan)}
                          >
                            {plan.isActive ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Plan
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate Plan
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlan(plan);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.type === 'survey_sent' && <Mail className="h-5 w-5 text-blue-500" />}
                    {activity.type === 'reminder_sent' && <Bell className="h-5 w-5 text-orange-500" />}
                    {activity.type === 'plan_created' && <Plus className="h-5 w-5 text-green-500" />}
                    {activity.type === 'plan_updated' && <Edit className="h-5 w-5 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Auto-Pilot Plan</DialogTitle>
            <DialogDescription>
              Set up automated survey sending with smart scheduling and reminders
            </DialogDescription>
          </DialogHeader>
          <AutoPilotPlanBuilder
            onSave={handleCreatePlan}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Auto-Pilot Plan</DialogTitle>
            <DialogDescription>
              Modify your auto-pilot plan settings
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <AutoPilotPlanBuilder
              onSave={handleUpdatePlan}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedPlan(null);
              }}
              initialPlan={selectedPlan}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Auto-Pilot Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone and will stop all automated surveys.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics Dialog */}
      <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Auto-Pilot Metrics</DialogTitle>
            <DialogDescription>
              Detailed analytics and performance metrics for your auto-pilot plans
            </DialogDescription>
          </DialogHeader>
          {metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Plans:</span>
                      <span className="font-medium">{metrics.totalSurveys}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Plans:</span>
                      <span className="font-medium">{metrics.activePlans}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Response Rate:</span>
                      <span className="font-medium">{metrics.averageResponseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Responses:</span>
                      <span className="font-medium">{metrics.totalResponses}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Next Scheduled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.nextScheduledSurvey ? (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {format(new Date(metrics.nextScheduledSurvey), "MMM d, yyyy")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(metrics.nextScheduledSurvey), "h:mm a")}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">No surveys scheduled</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {activity.type === 'survey_sent' && <Mail className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'reminder_sent' && <Bell className="h-4 w-4 text-orange-500" />}
                          {activity.type === 'plan_created' && <Plus className="h-4 w-4 text-green-500" />}
                          {activity.type === 'plan_updated' && <Edit className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutoPilotDashboard;
