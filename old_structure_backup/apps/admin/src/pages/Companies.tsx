import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Plus,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Users,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { companyService } from "@/services/api";

interface Company {
  id: number;
  name: string;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  users: number;
  activeUsers: number;
  billingCycle: 'Monthly' | 'Annual';
  status: 'Active' | 'Payment Failed' | 'Inactive';
  nextPayment: string;
  surveysSent: number;
  responsesCollected: number;
  eNPS: number;
  totalEmployees: number;
  managers: number;
  departments: number;
  industry: string;
  companySize: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  foundedYear?: number;
  headquarters?: string;
  website?: string;
}

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    plan: 'Basic' as 'Basic' | 'Premium' | 'Enterprise',
    users: 0,
    activeUsers: 0,
    billingCycle: 'Monthly' as 'Monthly' | 'Annual',
    status: 'Active' as 'Active' | 'Payment Failed' | 'Inactive',
    nextPayment: new Date().toISOString().split('T')[0],
    surveysSent: 0,
    responsesCollected: 0,
    eNPS: 0,
    totalEmployees: 0,
    managers: 0,
    departments: 0,
    industry: '',
    companySize: 'Small' as 'Small' | 'Medium' | 'Large' | 'Enterprise',
    foundedYear: new Date().getFullYear(),
    headquarters: '',
    website: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async () => {
    try {
      await companyService.createCompany({
        ...newCompany,
        nextPayment: new Date(newCompany.nextPayment),
      });
      toast.success('Company added successfully');
      setIsAddDialogOpen(false);
      setNewCompany({
        name: '',
        plan: 'Basic',
        users: 0,
        activeUsers: 0,
        billingCycle: 'Monthly',
        status: 'Active',
        nextPayment: new Date().toISOString().split('T')[0],
        surveysSent: 0,
        responsesCollected: 0,
        eNPS: 0,
        totalEmployees: 0,
        managers: 0,
        departments: 0,
        industry: '',
        companySize: 'Small',
        foundedYear: new Date().getFullYear(),
        headquarters: '',
        website: '',
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to add company');
    }
  };

  const handleDeleteCompany = async (id: number) => {
    try {
      await companyService.deleteCompany(id);
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const handleUpdateStatus = async (id: number, status: Company['status']) => {
    try {
      await companyService.updateCompany(id, { status });
      toast.success('Company status updated successfully');
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company status:', error);
      toast.error('Failed to update company status');
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || company.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPlan =
      planFilter === "all" || company.plan.toLowerCase() === planFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const planDistribution = companies.reduce((acc, company) => {
    acc[company.plan] = (acc[company.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalUsers = companies.reduce((sum, company) => sum + company.users, 0);
  const totalActiveUsers = companies.reduce((sum, company) => sum + company.activeUsers, 0);
  const adoptionRate = totalUsers > 0 ? (totalActiveUsers / totalUsers) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage and view details for all companies on the platform.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Enter the company details below. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">Plan *</Label>
                <Select
                  value={newCompany.plan}
                  onValueChange={(value: 'Basic' | 'Premium' | 'Enterprise') =>
                    setNewCompany({ ...newCompany, plan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billingCycle">Billing Cycle *</Label>
                <Select
                  value={newCompany.billingCycle}
                  onValueChange={(value: 'Monthly' | 'Annual') =>
                    setNewCompany({ ...newCompany, billingCycle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nextPayment">Next Payment Date *</Label>
                <Input
                  id="nextPayment"
                  type="date"
                  value={newCompany.nextPayment}
                  onChange={(e) => setNewCompany({ ...newCompany, nextPayment: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalEmployees">Total Employees *</Label>
                <Input
                  id="totalEmployees"
                  type="number"
                  value={newCompany.totalEmployees}
                  onChange={(e) => setNewCompany({ ...newCompany, totalEmployees: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="managers">Number of Managers *</Label>
                <Input
                  id="managers"
                  type="number"
                  value={newCompany.managers}
                  onChange={(e) => setNewCompany({ ...newCompany, managers: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="departments">Number of Departments *</Label>
                <Input
                  id="departments"
                  type="number"
                  value={newCompany.departments}
                  onChange={(e) => setNewCompany({ ...newCompany, departments: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companySize">Company Size *</Label>
                <Select
                  value={newCompany.companySize}
                  onValueChange={(value: 'Small' | 'Medium' | 'Large' | 'Enterprise') =>
                    setNewCompany({ ...newCompany, companySize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Small (1-50)</SelectItem>
                    <SelectItem value="Medium">Medium (51-200)</SelectItem>
                    <SelectItem value="Large">Large (201-1000)</SelectItem>
                    <SelectItem value="Enterprise">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={newCompany.foundedYear}
                  onChange={(e) => setNewCompany({ ...newCompany, foundedYear: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="headquarters">Headquarters</Label>
                <Input
                  id="headquarters"
                  value={newCompany.headquarters}
                  onChange={(e) => setNewCompany({ ...newCompany, headquarters: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCompany}>Add Company</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Company Overview</CardTitle>
          <CardDescription>
            A list of all companies using your platform with their key metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="payment failed">Payment Failed</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={planFilter}
                onValueChange={setPlanFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Managers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge variant={company.plan === 'Enterprise' ? 'default' : 'secondary'}>
                        {company.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{company.companySize}</TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>{company.totalEmployees}</TableCell>
                    <TableCell>{company.managers}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          company.status === 'Active'
                            ? 'success'
                            : company.status === 'Payment Failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(company.nextPayment).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleDeleteCompany(company.id)}>
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(
                                company.id,
                                company.status === 'Active' ? 'Inactive' : 'Active'
                              )
                            }
                          >
                            {company.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(planDistribution).map(([plan, count]) => (
                <div key={plan} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{plan}</span>
                    <span className="text-sm font-medium">{count} Companies</span>
                  </div>
                  <div className="bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(count / companies.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">User Adoption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Users</span>
                <span>{totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Active Users</span>
                <span>{totalActiveUsers}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Adoption Rate</span>
                  <span className="text-sm font-medium">{adoptionRate.toFixed(1)}%</span>
                </div>
                <div className="bg-secondary h-2 rounded-full">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: `${adoptionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Companies at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies
                .filter((company) => company.status === 'Payment Failed' || company.eNPS < 30)
                .slice(0, 2)
                .map((company) => (
                  <div key={company.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.status === 'Payment Failed' ? 'Payment failed' : 'Low engagement'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Contact</Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Companies;
