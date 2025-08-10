import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings as SettingsIcon,
  Bell,
  Users,
  Palette,
  Target,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  FileText,
  Calendar,
  TrendingUp,
  Shield,
  UserPlus,
  UserMinus,
  Upload,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  timeframe: string;
  isActive: boolean;
  notificationType: 'email' | 'slack' | 'both';
  recipients: string[];
}

interface SurveySettings {
  defaultFrequency: string;
  defaultQuestions: number;
  allowAnonymous: boolean;
  requireComments: boolean;
  autoReminders: boolean;
  reminderFrequency: string;
  scoreThreshold: number;
  participationGoal: number;
}

interface AdminRole {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr_manager' | 'team_lead';
  teams: string[];
  permissions: string[];
  lastActive: string;
  status: 'active' | 'inactive';
}

interface BrandingSettings {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  emailSignature: string;
  surveyTheme: 'professional' | 'friendly' | 'modern' | 'minimal';
  customCss: string;
}

interface CulturalOKR {
  id: string;
  quarter: string;
  theme: string;
  description: string;
  targets: {
    metric: string;
    current: number;
    target: number;
    unit: string;
  }[];
  status: 'active' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
}

const OwnerSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [surveySettings, setSurveySettings] = useState<SurveySettings>({
    defaultFrequency: 'monthly',
    defaultQuestions: 10,
    allowAnonymous: true,
    requireComments: false,
    autoReminders: true,
    reminderFrequency: 'weekly',
    scoreThreshold: 6.5,
    participationGoal: 80
  });
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    companyName: 'Novora',
    logo: '/uploads/5b77ec96-2245-4206-9aa7-a6b00a8dea4c.png',
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    emailSignature: 'Best regards,\nThe Novora Team',
    surveyTheme: 'professional',
    customCss: ''
  });
  const [culturalOKRs, setCulturalOKRs] = useState<CulturalOKR[]>([]);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        setLoading(true);
        
        // Mock alert rules
        const mockAlertRules: AlertRule[] = [
          {
            id: "1",
            name: "High Alert Volume",
            condition: "More than 3 alerts in a week",
            threshold: 3,
            timeframe: "week",
            isActive: true,
            notificationType: 'email',
            recipients: ['owner@novora.com', 'hr@novora.com']
          },
          {
            id: "2",
            name: "Score Drop Alert",
            condition: "Team score drops by more than 1.0 points",
            threshold: 1.0,
            timeframe: "month",
            isActive: true,
            notificationType: 'both',
            recipients: ['owner@novora.com']
          },
          {
            id: "3",
            name: "Low Participation",
            condition: "Participation rate below 60%",
            threshold: 60,
            timeframe: "survey",
            isActive: false,
            notificationType: 'slack',
            recipients: ['admin@novora.com']
          }
        ];
        setAlertRules(mockAlertRules);

        // Mock admin roles
        const mockAdminRoles: AdminRole[] = [
          {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah.johnson@novora.com",
            role: 'admin',
            teams: ["Sales", "Marketing"],
            permissions: ["view_all", "create_surveys", "manage_teams"],
            lastActive: "2024-01-15",
            status: 'active'
          },
          {
            id: "2",
            name: "Mike Chen",
            email: "mike.chen@novora.com",
            role: 'hr_manager',
            teams: ["Engineering"],
            permissions: ["view_team", "create_surveys"],
            lastActive: "2024-01-15",
            status: 'active'
          },
          {
            id: "3",
            name: "Lisa Rodriguez",
            email: "lisa.rodriguez@novora.com",
            role: 'admin',
            teams: ["HR", "Finance"],
            permissions: ["view_all", "create_surveys", "manage_teams"],
            lastActive: "2024-01-14",
            status: 'active'
          }
        ];
        setAdminRoles(mockAdminRoles);

        // Mock cultural OKRs
        const mockCulturalOKRs: CulturalOKR[] = [
          {
            id: "1",
            quarter: "Q1 2024",
            theme: "Building Trust & Transparency",
            description: "Foster open communication and build trust across all teams",
            targets: [
              {
                metric: "Trust Score",
                current: 7.2,
                target: 8.0,
                unit: "/10"
              },
              {
                metric: "Communication Satisfaction",
                current: 75,
                target: 85,
                unit: "%"
              },
              {
                metric: "Leadership Approval",
                current: 6.8,
                target: 7.5,
                unit: "/10"
              }
            ],
            status: 'active',
            startDate: "2024-01-01",
            endDate: "2024-03-31"
          },
          {
            id: "2",
            quarter: "Q4 2023",
            theme: "Employee Well-being",
            description: "Improve work-life balance and mental health support",
            targets: [
              {
                metric: "Work-Life Balance Score",
                current: 6.5,
                target: 7.0,
                unit: "/10"
              },
              {
                metric: "Stress Level",
                current: 4.2,
                target: 3.5,
                unit: "/10"
              }
            ],
            status: 'completed',
            startDate: "2023-10-01",
            endDate: "2023-12-31"
          }
        ];
        setCulturalOKRs(mockCulturalOKRs);
        
      } catch (error) {
        console.error('Error fetching settings data:', error);
        toast({
          title: "Error",
          description: "Failed to load settings data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, [toast]);

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully`,
    });
  };

  const handleAddAlertRule = () => {
    const newRule: AlertRule = {
      id: Date.now().toString(),
      name: "New Alert Rule",
      condition: "Custom condition",
      threshold: 1,
      timeframe: "week",
      isActive: true,
      notificationType: 'email',
      recipients: ['owner@novora.com']
    };
    setAlertRules([...alertRules, newRule]);
    toast({
      title: "Alert Rule Added",
      description: "New alert rule has been created",
    });
  };

  const handleAddOKR = () => {
    const newOKR: CulturalOKR = {
      id: Date.now().toString(),
      quarter: "Q2 2024",
      theme: "New Cultural Theme",
      description: "Description of the new cultural objective",
      targets: [
        {
          metric: "New Metric",
          current: 0,
          target: 10,
          unit: "/10"
        }
      ],
      status: 'draft',
      startDate: "2024-04-01",
      endDate: "2024-06-30"
    };
    setCulturalOKRs([...culturalOKRs, newOKR]);
    toast({
      title: "OKR Added",
      description: "New cultural OKR has been created",
    });
  };

  const handleLogoUpload = () => {
    toast({
      title: "Logo Upload",
      description: "Logo upload functionality would be implemented here",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'hr_manager': return 'text-blue-600 bg-blue-100';
      case 'team_lead': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Configure organization-wide settings and preferences for optimal platform usage
          </p>
        </div>

        {/* Enhanced Settings Tabs */}
        <div className="flex space-x-1 bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-8">
          {[
            { id: 'alerts', label: 'Alert Rules', icon: Bell },
            { id: 'surveys', label: 'Survey Settings', icon: FileText },
            { id: 'roles', label: 'Role Management', icon: Users },
            { id: 'branding', label: 'Company Branding', icon: Palette },
            { id: 'okrs', label: 'Cultural OKRs', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Enhanced Alert Rules Tab */}
        {activeTab === 'alerts' && (
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-red-600" />
                    </div>
                    <span>Organization Alert Rules</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configure automated alerts for organization-wide events and monitoring
                  </CardDescription>
                </div>
                <Button onClick={handleAddAlertRule} className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  <Plus className="w-4 h-4" />
                  <span>Add Rule</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Rule Name</TableHead>
                      <TableHead className="font-semibold text-gray-900">Condition</TableHead>
                      <TableHead className="font-semibold text-gray-900">Threshold</TableHead>
                      <TableHead className="font-semibold text-gray-900">Notification</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertRules.map((rule, index) => (
                      <TableRow 
                        key={rule.id}
                        className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <TableCell className="font-semibold text-gray-900">{rule.name}</TableCell>
                        <TableCell className="text-gray-700">{rule.condition}</TableCell>
                        <TableCell>
                          <div className="text-lg font-bold text-gray-900">
                            {rule.threshold} {rule.timeframe}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {rule.notificationType.charAt(0).toUpperCase() + rule.notificationType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? "default" : "secondary"} className="px-3 py-1 font-medium">
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Recipients</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
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
        )}

        {/* Enhanced Survey Settings Tab */}
        {activeTab === 'surveys' && (
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Survey Customization Settings</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Set defaults for all team surveys and customize survey behavior
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Default Survey Frequency</Label>
                  <Select value={surveySettings.defaultFrequency} onValueChange={(value) => setSurveySettings({...surveySettings, defaultFrequency: value})}>
                    <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Default Number of Questions</Label>
                  <Input
                    type="number"
                    value={surveySettings.defaultQuestions}
                    onChange={(e) => setSurveySettings({...surveySettings, defaultQuestions: parseInt(e.target.value)})}
                    className="hover:border-blue-300 transition-colors duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Score Threshold for Alerts</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={surveySettings.scoreThreshold}
                    onChange={(e) => setSurveySettings({...surveySettings, scoreThreshold: parseFloat(e.target.value)})}
                    className="hover:border-blue-300 transition-colors duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Participation Goal (%)</Label>
                  <Input
                    type="number"
                    value={surveySettings.participationGoal}
                    onChange={(e) => setSurveySettings({...surveySettings, participationGoal: parseInt(e.target.value)})}
                    className="hover:border-blue-300 transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-semibold text-gray-900">Survey Options</Label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={surveySettings.allowAnonymous}
                      onCheckedChange={(checked) => setSurveySettings({...surveySettings, allowAnonymous: checked})}
                    />
                    <Label className="font-medium">Allow Anonymous Responses</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={surveySettings.requireComments}
                      onCheckedChange={(checked) => setSurveySettings({...surveySettings, requireComments: checked})}
                    />
                    <Label className="font-medium">Require Comments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={surveySettings.autoReminders}
                      onCheckedChange={(checked) => setSurveySettings({...surveySettings, autoReminders: checked})}
                    />
                    <Label className="font-medium">Send Auto Reminders</Label>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Survey')} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Save className="w-4 h-4" />
                <span>Save Survey Settings</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Role Management Tab */}
        {activeTab === 'roles' && (
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <span>Role Management</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Assign and manage admin roles across teams with granular permissions
                  </CardDescription>
                </div>
                <Button className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <UserPlus className="w-4 h-4" />
                  <span>Add Admin</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Name</TableHead>
                      <TableHead className="font-semibold text-gray-900">Role</TableHead>
                      <TableHead className="font-semibold text-gray-900">Teams</TableHead>
                      <TableHead className="font-semibold text-gray-900">Permissions</TableHead>
                      <TableHead className="font-semibold text-gray-900">Last Active</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminRoles.map((admin, index) => (
                      <TableRow 
                        key={admin.id}
                        className={`hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-600">
                                {admin.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{admin.name}</div>
                              <div className="text-sm text-gray-500">{admin.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleColor(admin.role)} px-3 py-1 font-medium`}>
                            {admin.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">{admin.teams.join(', ')}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-lg font-bold text-gray-900">{admin.permissions.length} permissions</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{new Date(admin.lastActive).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.status === 'active' ? "default" : "secondary"} className="px-3 py-1 font-medium">
                            {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Role</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Manage Permissions</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <UserMinus className="mr-2 h-4 w-4" />
                                <span>Remove Access</span>
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
        )}

        {/* Enhanced Company Branding Tab */}
        {activeTab === 'branding' && (
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Company Branding</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  Customize the appearance and branding of surveys and communications
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Company Name</Label>
                  <Input
                    value={brandingSettings.companyName}
                    onChange={(e) => setBrandingSettings({...brandingSettings, companyName: e.target.value})}
                    className="hover:border-blue-300 transition-colors duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Survey Theme</Label>
                  <Select value={brandingSettings.surveyTheme} onValueChange={(value) => setBrandingSettings({...brandingSettings, surveyTheme: value as any})}>
                    <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={brandingSettings.primaryColor}
                      onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                      className="w-16 h-10 rounded-lg"
                    />
                    <Input
                      value={brandingSettings.primaryColor}
                      onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                      className="hover:border-blue-300 transition-colors duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-semibold text-gray-900">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={brandingSettings.secondaryColor}
                      onChange={(e) => setBrandingSettings({...brandingSettings, secondaryColor: e.target.value})}
                      className="w-16 h-10 rounded-lg"
                    />
                    <Input
                      value={brandingSettings.secondaryColor}
                      onChange={(e) => setBrandingSettings({...brandingSettings, secondaryColor: e.target.value})}
                      className="hover:border-blue-300 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold text-gray-900">Company Logo</Label>
                <div className="flex items-center space-x-4">
                  <img
                    src={brandingSettings.logo}
                    alt="Company Logo"
                    className="w-16 h-16 object-contain border rounded-lg shadow-sm"
                  />
                  <Button onClick={handleLogoUpload} variant="outline" className="flex items-center space-x-2 hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    <span>Upload New Logo</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold text-gray-900">Email Signature</Label>
                <Textarea
                  value={brandingSettings.emailSignature}
                  onChange={(e) => setBrandingSettings({...brandingSettings, emailSignature: e.target.value})}
                  rows={3}
                  className="hover:border-blue-300 transition-colors duration-200"
                />
              </div>

              <Button onClick={() => handleSaveSettings('Branding')} className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Save className="w-4 h-4" />
                <span>Save Branding Settings</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Cultural OKRs Tab */}
        {activeTab === 'okrs' && (
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>Cultural OKRs</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Define cultural themes and targets per quarter with progress tracking
                  </CardDescription>
                </div>
                <Button onClick={handleAddOKR} className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  <Plus className="w-4 h-4" />
                  <span>Add OKR</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {culturalOKRs.map((okr) => (
                  <Card key={okr.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-gray-900">{okr.quarter}</CardTitle>
                          <CardDescription className="text-base font-semibold text-gray-700">{okr.theme}</CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(okr.status)} px-3 py-1 font-medium`}>
                          {okr.status.charAt(0).toUpperCase() + okr.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{okr.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {okr.targets.map((target, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 bg-gradient-to-r from-gray-50 to-blue-50">
                              <div className="text-sm font-semibold text-gray-700">{target.metric}</div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="text-2xl font-bold text-blue-600">{target.current}</div>
                                <div className="text-sm text-gray-500">/ {target.target}{target.unit}</div>
                              </div>
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300" 
                                    style={{ width: `${Math.min((target.current / target.target) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Duration: {new Date(okr.startDate).toLocaleDateString()} - {new Date(okr.endDate).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="hover:bg-gray-50">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-gray-50">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Track Progress
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OwnerSettings; 