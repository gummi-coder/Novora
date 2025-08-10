import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

type Status = "Open" | "Resolved" | "Assigned";

interface AlertItem {
  id: string;
  date: string;
  team: string;
  trigger: string;
  status: Status;
  assignee?: string;
}

const statusBadge = (s: Status) => {
  switch (s) {
    case "Open": return "bg-red-100 text-red-700";
    case "Resolved": return "bg-green-100 text-green-700";
    case "Assigned": return "bg-yellow-100 text-yellow-700";
  }
};

const Alerts = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const alerts = useMemo<AlertItem[]>(
    () => [
      { id: "1", date: "Aug 3", team: "Sales", trigger: "Score ↓ 22%", status: "Open", assignee: "You" },
      { id: "2", date: "Aug 2", team: "Marketing", trigger: "Flagged comment", status: "Assigned", assignee: "Alex" },
      { id: "3", date: "Aug 1", team: "Ops", trigger: "Participation ↓", status: "Resolved" },
    ],
    []
  );

  const filtered = alerts.filter((a) => (statusFilter === "all" ? true : a.status === statusFilter));

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
                      <div className="font-semibold text-gray-900">{a.team} — {a.trigger}</div>
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
                    <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-200">
                      Resolve
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200">
                      Assign
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
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
      </div>
    </div>
  );
};

export default Alerts;


