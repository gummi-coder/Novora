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
  CreditCard,
  DollarSign,
  Users,
  BarChart3,
  AlertCircle,
  Settings,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  TrendingUp,
  PieChart,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "annual";
  features: string[];
  isPopular?: boolean;
  isBeta?: boolean;
}

interface BillingMetrics {
  mrr: number;
  arr: number;
  arpu: number;
  planDistribution: Record<string, number>;
  totalCompanies: number;
  companiesByPlan: Record<string, number>;
}

const BillingPage = () => {
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [plans] = useState<Plan[]>([
    {
      id: "core",
      name: "Core Plan",
      description: "Essential features for small teams",
      price: 99,
      billingCycle: "monthly",
      features: [
        "Up to 10 team members",
        "Basic analytics",
        "Email support",
        "5GB storage",
        "100 API calls/month"
      ]
    },
    {
      id: "pro",
      name: "Pro Plan",
      description: "Advanced features for growing businesses",
      price: 249,
      billingCycle: "monthly",
      features: [
        "Up to 50 team members",
        "Advanced analytics",
        "Priority support",
        "50GB storage",
        "1000 API calls/month",
        "Custom integrations"
      ],
      isPopular: true
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      description: "Custom solutions for large organizations",
      price: 499,
      billingCycle: "monthly",
      features: [
        "Unlimited team members",
        "Enterprise analytics",
        "24/7 dedicated support",
        "Unlimited storage",
        "Unlimited API calls",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated account manager"
      ]
    }
  ]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/companies/metrics/billing');
        if (!response.ok) {
          throw new Error('Failed to fetch billing metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage pricing plans, promotions, and billing operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics?.mrr.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics?.arr.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per Company</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics?.arpu.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.planDistribution && Object.entries(metrics.planDistribution).map(([plan, percentage]) => (
                <div key={plan} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{plan}</span>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="bg-muted h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Billing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Active Companies</span>
                <span className="font-medium">{metrics?.totalCompanies}</span>
              </div>
              {metrics?.companiesByPlan && Object.entries(metrics.companiesByPlan).map(([plan, count]) => (
                <div key={plan} className="flex justify-between">
                  <span>{plan} Customers</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Average Contract Value</span>
                <span className="font-medium">€{metrics?.arpu.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Pricing Plans</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Plan
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.isPopular ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.description}
                      </p>
                    </div>
                    {plan.isPopular && (
                      <Badge variant="secondary">Most Popular</Badge>
                    )}
                    {plan.isBeta && (
                      <Badge variant="outline">Beta</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">€{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 space-x-2">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metered Usage Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Base Rate</TableHead>
                    <TableHead>Overage Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>API Calls</TableCell>
                    <TableCell>per 1000</TableCell>
                    <TableCell>€0.10</TableCell>
                    <TableCell>€0.15</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Storage</TableCell>
                    <TableCell>per GB</TableCell>
                    <TableCell>€0.50</TableCell>
                    <TableCell>€0.75</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Promotional Codes</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage Limit</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>WELCOME20</TableCell>
                    <TableCell>20% off</TableCell>
                    <TableCell>100/100</TableCell>
                    <TableCell>2024-12-31</TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Invoices</h2>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>INV-001</TableCell>
                    <TableCell>Acme Corp</TableCell>
                    <TableCell>€249.00</TableCell>
                    <TableCell>2024-03-15</TableCell>
                    <TableCell>
                      <Badge variant="success">Paid</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Revenue chart will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Growth chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Lifetime Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Acme Corp</TableCell>
                    <TableCell>Enterprise</TableCell>
                    <TableCell>€499.00</TableCell>
                    <TableCell>€5,988.00</TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingPage;
