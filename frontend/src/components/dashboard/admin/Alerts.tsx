import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, User, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Status = "Open" | "Resolved" | "Assigned";

interface AlertItem {
  id: string;
  date: string;
  team: string;
  trigger: string;
  status: Status;
  assignee?: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'engagement' | 'feedback' | 'system';
}

interface AlertHistory {
  id: string;
  date: string;
  action: string;
  user: string;
  notes?: string;
}

const statusBadge = (s: Status) => {
  switch (s) {
    case "Open": return "bg-red-100 text-red-700";
    case "Resolved": return "bg-green-100 text-green-700";
    case "Assigned": return "bg-yellow-100 text-yellow-700";
  }
};

const Alerts = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [resolveNotes, setResolveNotes] = useState<string>("");
  const [assignTo, setAssignTo] = useState<string>("");

  const alerts = useMemo<AlertItem[]>(
    () => [
      { 
        id: "1", 
        date: "Aug 3", 
        team: "Sales", 
        trigger: "Score ↓ 22%", 
        status: "Open", 
        assignee: "You",
        description: "Sales team engagement score has dropped significantly from 8.2 to 6.4 over the past month. This represents a 22% decline and is below the company threshold of 7.0.",
        priority: 'high',
        category: 'performance'
      },
      { 
        id: "2", 
        date: "Aug 2", 
        team: "Marketing", 
        trigger: "Flagged comment", 
        status: "Assigned", 
        assignee: "Alex",
        description: "A negative comment was flagged in the feedback system regarding the new marketing campaign. The comment suggests team dissatisfaction with the current direction.",
        priority: 'medium',
        category: 'feedback'
      },
      { 
        id: "3", 
        date: "Aug 1", 
        team: "Operations", 
        trigger: "Participation ↓", 
        status: "Resolved",
        description: "Operations team participation rate dropped to 65%, below the 80% threshold. This was resolved through team communication and process improvements.",
        priority: 'medium',
        category: 'engagement'
      },
      { 
        id: "4", 
        date: "Jul 31", 
        team: "Engineering", 
        trigger: "System issue", 
        status: "Open",
        description: "Multiple reports of the development environment being unstable and causing delays in project delivery. Team productivity is being affected.",
        priority: 'high',
        category: 'system'
      },
      { 
        id: "5", 
        date: "Jul 30", 
        team: "HR", 
        trigger: "Low satisfaction", 
        status: "Assigned",
        assignee: "Sarah",
        description: "HR team satisfaction scores are trending downward, with concerns about workload and resource allocation being raised in recent surveys.",
        priority: 'medium',
        category: 'engagement'
      },
      { 
        id: "6", 
        date: "Jul 29", 
        team: "Finance", 
        trigger: "Process concern", 
        status: "Resolved",
        description: "Finance team raised concerns about the new expense approval process. This was resolved by implementing additional training and process clarification.",
        priority: 'low',
        category: 'feedback'
      }
    ],
    []
  );

  // Mock history data
  const alertHistory: AlertHistory[] = [
    { id: "1", date: "Aug 3, 10:30 AM", action: "Alert Created", user: "System", notes: "Automated alert triggered due to score threshold breach" },
    { id: "2", date: "Aug 3, 11:15 AM", action: "Assigned", user: "Admin", notes: "Assigned to current user for investigation" },
    { id: "3", date: "Aug 3, 2:45 PM", action: "Comment Added", user: "Admin", notes: "Initial investigation started - reviewing team survey responses" },
    { id: "4", date: "Aug 3, 4:20 PM", action: "Team Meeting Scheduled", user: "Admin", notes: "Scheduled team meeting for Aug 5 to discuss concerns" }
  ];

  const filtered = alerts.filter((a) => (statusFilter === "all" ? true : a.status === statusFilter));

  // Handler functions
  const handleResolve = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setResolveNotes("");
    setShowResolveModal(true);
  };

  const handleAssign = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setAssignTo("");
    setShowAssignModal(true);
  };

  const handleHistory = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setShowHistoryModal(true);
  };

  const handleSaveResolve = () => {
    if (selectedAlert) {
      toast({
        title: "Alert Resolved",
        description: `${selectedAlert.team} alert has been marked as resolved`,
      });
      setShowResolveModal(false);
      setSelectedAlert(null);
      setResolveNotes("");
    }
  };

  const handleSaveAssign = () => {
    if (selectedAlert && assignTo) {
      toast({
        title: "Alert Assigned",
        description: `${selectedAlert.team} alert has been assigned to ${assignTo}`,
      });
      setShowAssignModal(false);
      setSelectedAlert(null);
      setAssignTo("");
    }
  };

  const handleCloseModals = () => {
    setShowResolveModal(false);
    setShowAssignModal(false);
    setShowHistoryModal(false);
    setSelectedAlert(null);
    setResolveNotes("");
    setAssignTo("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Central triage for red flags and team issues requiring immediate attention
          </p>
        </div>

        {/* Enhanced Filters Card */}
        <Card className="mb-8 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </div>
                  <span>Filters</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Filter alerts by status to focus on specific priorities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Active Alerts */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <span>Active Alerts</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Resolve, delegate or add comments to address team issues
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filtered.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {a.team} — {a.trigger}
                        <Badge className={`px-2 py-1 text-xs ${
                          a.priority === 'high' ? 'bg-red-100 text-red-700' :
                          a.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {a.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                        <span>{a.date}</span>
                        {a.assignee && (
                          <>
                            <span>•</span>
                            <span className="font-medium">Assigned: {a.assignee}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${statusBadge(a.status)} px-3 py-1 font-medium`}>
                      {a.status}
                    </Badge>
                    {a.status !== "Resolved" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-green-50 hover:border-green-200"
                        onClick={() => handleResolve(a)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                    {a.status === "Open" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-blue-50 hover:border-blue-200"
                        onClick={() => handleAssign(a)}
                      >
                        <User className="w-4 h-4 mr-1" />
                        Assign
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hover:bg-purple-50 hover:border-purple-200"
                      onClick={() => handleHistory(a)}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      History
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No alerts for this filter</p>
                  <p className="text-gray-400 text-sm mt-1">All clear! No issues require attention</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resolve Modal */}
        <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Resolve Alert</span>
              </DialogTitle>
              <DialogDescription>
                Mark this alert as resolved and add resolution notes
              </DialogDescription>
            </DialogHeader>
            
            {selectedAlert && (
              <div className="space-y-6">
                {/* Alert Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">{selectedAlert.team} — {selectedAlert.trigger}</div>
                    <Badge className={`px-2 py-1 text-xs ${
                      selectedAlert.priority === 'high' ? 'bg-red-100 text-red-700' :
                      selectedAlert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedAlert.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">{selectedAlert.description}</div>
                </div>

                {/* Resolution Notes */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Resolution Notes</Label>
                  <Textarea
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Describe how this alert was resolved, actions taken, and any follow-up required..."
                    className="min-h-[120px]"
                  />
                </div>



                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={handleCloseModals}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveResolve}>
                    Resolve Alert
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="w-6 h-6 text-blue-600" />
                <span>Assign Alert</span>
              </DialogTitle>
              <DialogDescription>
                Assign this alert to a team member for investigation and resolution
              </DialogDescription>
            </DialogHeader>
            
            {selectedAlert && (
              <div className="space-y-6">
                {/* Alert Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">{selectedAlert.team} — {selectedAlert.trigger}</div>
                    <Badge className={`px-2 py-1 text-xs ${
                      selectedAlert.priority === 'high' ? 'bg-red-100 text-red-700' :
                      selectedAlert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedAlert.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">{selectedAlert.description}</div>
                </div>

                {/* Assign To */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Assign To</Label>
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select team member..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alex">Alex Johnson - Team Lead</SelectItem>
                      <SelectItem value="sarah">Sarah Chen - HR Manager</SelectItem>
                      <SelectItem value="mike">Mike Rodriguez - Operations</SelectItem>
                      <SelectItem value="emma">Emma Wilson - Senior Admin</SelectItem>
                      <SelectItem value="david">David Kim - Technical Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignment Notes */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Assignment Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any specific instructions or context for the assignee..."
                    className="min-h-[100px]"
                  />
                </div>



                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={handleCloseModals}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAssign} disabled={!assignTo}>
                    Assign Alert
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* History Modal */}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-purple-600" />
                <span>Alert History</span>
              </DialogTitle>
              <DialogDescription>
                Complete timeline of actions taken on this alert
              </DialogDescription>
            </DialogHeader>
            
            {selectedAlert && (
              <div className="space-y-6">
                {/* Alert Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-900">{selectedAlert.team} — {selectedAlert.trigger}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={`px-2 py-1 text-xs ${
                        selectedAlert.priority === 'high' ? 'bg-red-100 text-red-700' :
                        selectedAlert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {selectedAlert.priority.toUpperCase()}
                      </Badge>
                      <Badge className={`${statusBadge(selectedAlert.status)} px-2 py-1 text-xs`}>
                        {selectedAlert.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{selectedAlert.description}</div>
                </div>

                {/* History Timeline */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Action Timeline</Label>
                  <div className="space-y-3">
                    {alertHistory.map((history) => (
                      <div key={history.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900">{history.action}</div>
                            <div className="text-sm text-gray-500">{history.date}</div>
                          </div>
                          <div className="text-sm text-gray-600">By: {history.user}</div>
                          {history.notes && (
                            <div className="text-sm text-gray-500 mt-1">{history.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>



                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button onClick={handleCloseModals}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Alerts;


