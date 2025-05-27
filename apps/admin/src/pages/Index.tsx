
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Building, Users, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/system-alerts")}>View System Alerts</Button>
          <Button onClick={() => navigate("/settings")}>Platform Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Companies"
          value="24"
          icon={<Building className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
          className="bg-white rounded-lg shadow p-5"
        />
        <StatCard
          title="Total Users"
          value="487"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
          className="bg-white rounded-lg shadow p-5"
        />
        <StatCard
          title="Revenue MRR"
          value="$32,580"
          icon={<CreditCard className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
          className="bg-white rounded-lg shadow p-5"
        />
        <StatCard
          title="Engagement Score"
          value="78%"
          icon={<BarChart3 className="h-5 w-5" />}
          trend={{ value: 3, isPositive: false }}
          className="bg-white rounded-lg shadow p-5"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Overview of system status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>API Uptime</span>
                <span className="text-green-500 font-medium">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Database Status</span>
                <span className="text-green-500 font-medium">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Job Queue</span>
                <span className="text-green-500 font-medium">No backlog</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Notification Service</span>
                <span className="text-green-500 font-medium">Operational</span>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">View Detailed Health Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>The latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">New company joined</p>
                  <p className="text-sm text-muted-foreground">TechCorp started their trial</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Billing event</p>
                  <p className="text-sm text-muted-foreground">Acme Inc. upgraded to Enterprise plan</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Analytics spike</p>
                  <p className="text-sm text-muted-foreground">Unusual activity detected in survey responses</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
