import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  Shield,
  Star,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  Settings,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PlanDetails, BillingEvent, TrialInfo, UpgradePotential, BillingError } from "./types";

const PlanBillingOverview = () => {
  const { toast } = useToast();
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([]);
  const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
  const [upgradePotential, setUpgradePotential] = useState<UpgradePotential | null>(null);
  const [billingErrors, setBillingErrors] = useState<BillingError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanBillingData = async () => {
      try {
        setLoading(true);
        const response = await api.getPlanBillingOverview();
        setPlanDetails(response.planDetails);
        setBillingEvents(response.billingEvents);
        setTrialInfo(response.trialInfo);
        setUpgradePotential(response.upgradePotential);
        setBillingErrors(response.billingErrors);
      } catch (error) {
        console.error('Error fetching plan billing data:', error);
        toast({
          title: "Error",
          description: "Failed to load plan and billing data",
          variant: "destructive"
        });
        // Fallback to mock data
        setPlanDetails({
          currentPlan: 'starter',
          planName: 'Starter Plan',
          monthlyPrice: 29,
          yearlyPrice: 290,
          features: ['Up to 50 users', 'Unlimited surveys', 'Basic analytics', 'Email support'],
          limits: { users: 50, surveys: 100, responses: 1000, storage: 5 },
          usage: { users: 42, surveys: 78, responses: 850, storage: 3.2 },
          nextBillingDate: '2024-02-15T00:00:00Z',
          billingCycle: 'monthly',
          status: 'active'
        });
        setBillingEvents([
          {
            id: "1",
            type: 'payment_success',
            amount: 29.00,
            currency: 'USD',
            date: '2024-01-15T10:30:00Z',
            status: 'success',
            description: 'Monthly subscription payment',
            invoiceUrl: 'https://stripe.com/invoices/inv_123'
          },
          {
            id: "2",
            type: 'subscription_created',
            amount: 0,
            currency: 'USD',
            date: '2024-01-01T09:00:00Z',
            status: 'success',
            description: 'Started Starter plan trial'
          }
        ]);
        setTrialInfo({
          isTrial: false,
          daysLeft: 0,
          trialEndDate: '2024-01-15T00:00:00Z',
          canExtend: false
        });
        setUpgradePotential({
          hasUpgradePotential: true,
          currentUsage: 42,
          usagePercentage: 84,
          recommendedPlan: 'Growth',
          reason: 'Using 84% of user limit',
          estimatedCost: 79
        });
        setBillingErrors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanBillingData();
  }, [toast]);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'starter': return <Star className="h-5 w-5" />;
      case 'growth': return <TrendingUp className="h-5 w-5" />;
      case 'enterprise': return <Shield className="h-5 w-5" />;
      default: return <Star className="h-5 w-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-100 text-blue-800';
      case 'growth': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillingEventIcon = (type: string) => {
    switch (type) {
      case 'payment_success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'payment_failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'subscription_created': return <Star className="h-4 w-4 text-blue-600" />;
      case 'subscription_updated': return <Settings className="h-4 w-4 text-orange-600" />;
      case 'trial_started': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'trial_ended': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleUpgrade = () => {
    // In a real app, this would redirect to the upgrade page
    toast({
      title: "Upgrade",
      description: "Redirecting to upgrade page...",
    });
  };

  const handleBillingPortal = () => {
    // In a real app, this would redirect to Stripe billing portal
    toast({
      title: "Billing Portal",
      description: "Redirecting to billing portal...",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan & Billing Overview</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!planDetails) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plan & Billing Overview</h2>
          <p className="text-gray-600">Manage your subscription, billing, and plan usage</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleBillingPortal}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Billing Portal
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getPlanIcon(planDetails.currentPlan)}
              <span>Current Plan</span>
              <Badge className={getPlanColor(planDetails.currentPlan)}>
                {planDetails.planName}
              </Badge>
            </CardTitle>
            <CardDescription>
              {formatCurrency(planDetails.monthlyPrice)}/month • {formatCurrency(planDetails.yearlyPrice)}/year
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge className={getStatusColor(planDetails.status)}>
                {planDetails.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Billing Cycle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Billing Cycle</span>
              <span className="text-sm text-gray-600 capitalize">{planDetails.billingCycle}</span>
            </div>

            {/* Next Billing */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next Billing</span>
              <span className="text-sm text-gray-600">{formatDate(planDetails.nextBillingDate)}</span>
            </div>

            {/* Plan Features */}
            <div>
              <h4 className="text-sm font-medium mb-2">Plan Features</h4>
              <ul className="space-y-1">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Usage & Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Usage & Limits
            </CardTitle>
            <CardDescription>
              Current usage against your plan limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Users */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Users</span>
                <span className="text-sm text-gray-600">
                  {planDetails.usage.users}/{planDetails.limits.users}
                </span>
              </div>
              <Progress value={(planDetails.usage.users / planDetails.limits.users) * 100} />
            </div>

            {/* Surveys */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Surveys</span>
                <span className="text-sm text-gray-600">
                  {planDetails.usage.surveys}/{planDetails.limits.surveys}
                </span>
              </div>
              <Progress value={(planDetails.usage.surveys / planDetails.limits.surveys) * 100} />
            </div>

            {/* Responses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Responses</span>
                <span className="text-sm text-gray-600">
                  {planDetails.usage.responses.toLocaleString()}/{planDetails.limits.responses.toLocaleString()}
                </span>
              </div>
              <Progress value={(planDetails.usage.responses / planDetails.limits.responses) * 100} />
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-gray-600">
                  {planDetails.usage.storage}GB/{planDetails.limits.storage}GB
                </span>
              </div>
              <Progress value={(planDetails.usage.storage / planDetails.limits.storage) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial Status & Upgrade Potential */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trial Status */}
        {trialInfo && trialInfo.isTrial && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Clock className="h-5 w-5 mr-2" />
                Trial Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Days Left</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {trialInfo.daysLeft} days
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trial Ends</span>
                  <span className="text-sm text-gray-600">{formatDate(trialInfo.trialEndDate)}</span>
                </div>
                {trialInfo.canExtend && (
                  <Button size="sm" className="w-full">
                    Extend Trial
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Potential */}
        {upgradePotential && upgradePotential.hasUpgradePotential && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <TrendingUp className="h-5 w-5 mr-2" />
                Upgrade Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-orange-800">
                  {upgradePotential.reason}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recommended</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {upgradePotential.recommendedPlan}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Cost</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(upgradePotential.estimatedCost)}/month
                  </span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={handleUpgrade}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Billing Events & Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Billing Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Recent Billing Events
            </CardTitle>
            <CardDescription>
              Latest payment and subscription activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getBillingEventIcon(event.type)}
                    <div>
                      <p className="text-sm font-medium">{event.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {event.amount > 0 && (
                      <p className="text-sm font-medium">{formatCurrency(event.amount, event.currency)}</p>
                    )}
                    <Badge 
                      variant={event.status === 'success' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Billing Issues
            </CardTitle>
            <CardDescription>
              Payment failures and billing errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {billingErrors.length > 0 ? (
              <div className="space-y-3">
                {billingErrors.map((error) => (
                  <div key={error.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-900">{error.message}</p>
                        <p className="text-xs text-red-700">{formatDate(error.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={error.resolved ? 'default' : 'destructive'} className="text-xs">
                        {error.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                      {!error.resolved && (
                        <p className="text-xs text-red-600 mt-1">Retry: {error.retryCount}/3</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No billing issues found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanBillingOverview; 