import { Building, Users, BarChart3, Send, Activity, CreditCard, AreaChart } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/TrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { userService, companyService } from "@/services/api";

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  status: 'Active' | 'Payment Failed' | 'Inactive';
  totalEmployees: number;
}

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, companiesData] = await Promise.all([
          userService.getUsers(),
          companyService.getCompanies()
        ]);
        setUsers(usersData);
        setCompanies(companiesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const activeCompanies = companies.filter(company => company.status === 'Active').length;
  const totalEmployees = companies.reduce((sum, company) => sum + (company.totalEmployees || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Platform-wide metrics and key performance indicators.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Companies"
          value={activeCompanies.toString()}
          icon={<Building className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Users"
          value={totalEmployees.toString()}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Regular Users"
          value={users.filter(user => user.role === 'user').length.toString()}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="New Users Today"
          value={users.filter(user => {
            const today = new Date();
            const userDate = new Date(user.created_at);
            return userDate.toDateString() === today.toDateString();
          }).length.toString()}
          icon={<BarChart3 className="h-5 w-5" />}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-info-50 flex items-center justify-center text-info-700">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{user.email}</p>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-medium">User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Admin Users</span>
                  <span className="text-sm font-medium">
                    {((users.filter(user => user.role === 'admin').length / users.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(users.filter(user => user.role === 'admin').length / users.length) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Regular Users</span>
                  <span className="text-sm font-medium">
                    {((users.filter(user => user.role === 'user').length / users.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(users.filter(user => user.role === 'user').length / users.length) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full">View All Users</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
