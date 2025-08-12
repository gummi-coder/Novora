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
  Download,
  XCircle,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  
  // Alert Rules modal states
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [showEditAlertModal, setShowEditAlertModal] = useState(false);
  const [showViewRecipientsModal, setShowViewRecipientsModal] = useState(false);
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const [selectedAlertRule, setSelectedAlertRule] = useState<AlertRule | null>(null);
  
  // Form states for new/edit alert rule
  const [newAlertRule, setNewAlertRule] = useState({
    name: '',
    condition: '',
    threshold: 1,
    timeframe: 'week',
    notificationType: 'email' as 'email' | 'slack' | 'both',
    recipients: ['owner@novora.com']
  });
  
  // Loading states
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Role Management modal states
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showManagePermissionsModal, setShowManagePermissionsModal] = useState(false);
  const [showRemoveAccessModal, setShowRemoveAccessModal] = useState(false);
  const [selectedAdminRole, setSelectedAdminRole] = useState<AdminRole | null>(null);
  
  // Form states for new/edit admin role
  const [newAdminRole, setNewAdminRole] = useState({
    name: '',
    email: '',
    role: 'admin' as 'admin' | 'hr_manager' | 'team_lead',
    teams: [] as string[],
    permissions: [] as string[]
  });
  
  // Cultural OKRs modal states
  const [showAddOKRModal, setShowAddOKRModal] = useState(false);
  const [showEditOKRModal, setShowEditOKRModal] = useState(false);
  const [showTrackProgressModal, setShowTrackProgressModal] = useState(false);
  const [selectedOKR, setSelectedOKR] = useState<CulturalOKR | null>(null);
  
  // Form states for new/edit OKR
  const [newOKR, setNewOKR] = useState({
    quarter: '',
    theme: '',
    description: '',
    targets: [
      { metric: '', current: 0, target: 0, unit: '' }
    ],
    startDate: '',
    endDate: ''
  });

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
            description: "Improve overall employee satisfaction and well-being",
            targets: [
              {
                metric: "Employee Satisfaction",
                current: 8.1,
                target: 8.5,
                unit: "/10"
              },
              {
                metric: "Work-Life Balance",
                current: 7.8,
                target: 8.2,
                unit: "/10"
              },
              {
                metric: "Stress Level",
                current: 3.2,
                target: 2.8,
                unit: "/10"
              }
            ],
            status: 'completed',
            startDate: "2023-10-01",
            endDate: "2023-12-31"
          }
        ];
        setCulturalOKRs(mockCulturalOKRs);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching settings data:', error);
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  const handleSaveSettings = async (section: string) => {
    try {
      setSavingSettings(true);
      
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically make an API call to save the settings
      // For now, we'll just show a success message
      
      toast({
        title: "Settings Saved Successfully",
        description: `${section} settings have been updated and applied to all surveys`,
      });
      
      // You could also add additional feedback like:
      // - Updating a "last saved" timestamp
      // - Refreshing any cached data
      // - Triggering a revalidation of related components
      
    } catch (error) {
      toast({
        title: "Save Failed",
        description: `Failed to save ${section.toLowerCase()} settings. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddAlertRule = () => {
    setNewAlertRule({
      name: '',
      condition: '',
      threshold: 1,
      timeframe: 'week',
      notificationType: 'email',
      recipients: ['owner@novora.com']
    });
    setShowAddAlertModal(true);
  };

  const handleCreateAlertRule = async () => {
    try {
      const newRule: AlertRule = {
        id: Date.now().toString(),
        name: newAlertRule.name,
        condition: newAlertRule.condition,
        threshold: newAlertRule.threshold,
        timeframe: newAlertRule.timeframe,
        isActive: true,
        notificationType: newAlertRule.notificationType,
        recipients: newAlertRule.recipients
      };
      
      setAlertRules(prev => [newRule, ...prev]);
      setShowAddAlertModal(false);
      
      toast({
        title: "Alert Rule Created",
        description: `${newRule.name} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert rule",
        variant: "destructive"
      });
    }
  };

  const handleAddOKR = () => {
    setNewOKR({
      quarter: '',
      theme: '',
      description: '',
      targets: [
        { metric: '', current: 0, target: 0, unit: '' }
      ],
      startDate: '',
      endDate: ''
    });
    setShowAddOKRModal(true);
  };

  const handleCreateOKR = async () => {
    try {
      const newOKRObject: CulturalOKR = {
        id: Date.now().toString(),
        quarter: newOKR.quarter,
        theme: newOKR.theme,
        description: newOKR.description,
        targets: newOKR.targets.filter(target => target.metric.trim() !== ''),
        status: 'draft',
        startDate: newOKR.startDate,
        endDate: newOKR.endDate
      };
      
      setCulturalOKRs(prev => [newOKRObject, ...prev]);
      setShowAddOKRModal(false);
      
      toast({
        title: "OKR Created",
        description: `${newOKRObject.theme} OKR has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create OKR",
        variant: "destructive"
      });
    }
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

  // Alert Rules action handlers
  const handleEditAlertRule = (rule: AlertRule) => {
    setSelectedAlertRule(rule);
    setNewAlertRule({
      name: rule.name,
      condition: rule.condition,
      threshold: rule.threshold,
      timeframe: rule.timeframe,
      notificationType: rule.notificationType,
      recipients: rule.recipients
    });
    setShowEditAlertModal(true);
  };

  const handleUpdateAlertRule = async () => {
    try {
      if (!selectedAlertRule) return;
      
      const updatedRule: AlertRule = {
        ...selectedAlertRule,
        name: newAlertRule.name,
        condition: newAlertRule.condition,
        threshold: newAlertRule.threshold,
        timeframe: newAlertRule.timeframe,
        notificationType: newAlertRule.notificationType,
        recipients: newAlertRule.recipients
      };
      
      setAlertRules(prev => prev.map(rule => 
        rule.id === selectedAlertRule.id ? updatedRule : rule
      ));
      setShowEditAlertModal(false);
      setSelectedAlertRule(null);
      
      toast({
        title: "Alert Rule Updated",
        description: `${updatedRule.name} has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert rule",
        variant: "destructive"
      });
    }
  };

  const handleViewRecipients = (rule: AlertRule) => {
    setSelectedAlertRule(rule);
    setShowViewRecipientsModal(true);
  };

  const handleDeleteAlertRule = (rule: AlertRule) => {
    setSelectedAlertRule(rule);
    setShowDeleteAlertModal(true);
  };

  const handleConfirmDeleteAlert = async () => {
    try {
      if (!selectedAlertRule) return;
      
      setAlertRules(prev => prev.filter(rule => rule.id !== selectedAlertRule.id));
      setShowDeleteAlertModal(false);
      setSelectedAlertRule(null);
      
      toast({
        title: "Alert Rule Deleted",
        description: `${selectedAlertRule.name} has been removed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert rule",
        variant: "destructive"
      });
    }
  };

  // Role Management handlers
  const handleAddAdmin = () => {
    setNewAdminRole({
      name: '',
      email: '',
      role: 'admin',
      teams: [],
      permissions: []
    });
    setShowAddAdminModal(true);
  };

  const handleCreateAdmin = async () => {
    try {
      const newAdmin: AdminRole = {
        id: Date.now().toString(),
        name: newAdminRole.name,
        email: newAdminRole.email,
        role: newAdminRole.role,
        teams: newAdminRole.teams,
        permissions: newAdminRole.permissions,
        lastActive: new Date().toISOString(),
        status: 'active'
      };
      
      setAdminRoles(prev => [newAdmin, ...prev]);
      setShowAddAdminModal(false);
      
      toast({
        title: "Admin Added",
        description: `${newAdmin.name} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive"
      });
    }
  };

  const handleEditRole = (admin: AdminRole) => {
    setSelectedAdminRole(admin);
    setNewAdminRole({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      teams: admin.teams,
      permissions: admin.permissions
    });
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = async () => {
    try {
      if (!selectedAdminRole) return;
      
      const updatedAdmin: AdminRole = {
        ...selectedAdminRole,
        name: newAdminRole.name,
        email: newAdminRole.email,
        role: newAdminRole.role,
        teams: newAdminRole.teams,
        permissions: newAdminRole.permissions
      };
      
      setAdminRoles(prev => prev.map(admin => 
        admin.id === selectedAdminRole.id ? updatedAdmin : admin
      ));
      setShowEditRoleModal(false);
      setSelectedAdminRole(null);
      
      toast({
        title: "Role Updated",
        description: `${updatedAdmin.name}'s role has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const handleManagePermissions = (admin: AdminRole) => {
    setSelectedAdminRole(admin);
    setShowManagePermissionsModal(true);
  };

  const handleRemoveAccess = (admin: AdminRole) => {
    setSelectedAdminRole(admin);
    setShowRemoveAccessModal(true);
  };

  const handleConfirmRemoveAccess = async () => {
    try {
      if (!selectedAdminRole) return;
      
      setAdminRoles(prev => prev.map(admin => 
        admin.id === selectedAdminRole.id 
          ? { ...admin, status: 'inactive' as const }
          : admin
      ));
      setShowRemoveAccessModal(false);
      setSelectedAdminRole(null);
      
      toast({
        title: "Access Removed",
        description: `${selectedAdminRole.name}'s access has been deactivated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove access",
        variant: "destructive"
      });
    }
  };

  // Cultural OKRs handlers
  const handleEditOKR = (okr: CulturalOKR) => {
    setSelectedOKR(okr);
    setNewOKR({
      quarter: okr.quarter,
      theme: okr.theme,
      description: okr.description,
      targets: okr.targets.length > 0 ? okr.targets : [{ metric: '', current: 0, target: 0, unit: '' }],
      startDate: okr.startDate,
      endDate: okr.endDate
    });
    setShowEditOKRModal(true);
  };

  const handleUpdateOKR = async () => {
    try {
      if (!selectedOKR) return;
      
      const updatedOKR: CulturalOKR = {
        ...selectedOKR,
        quarter: newOKR.quarter,
        theme: newOKR.theme,
        description: newOKR.description,
        targets: newOKR.targets.filter(target => target.metric.trim() !== ''),
        startDate: newOKR.startDate,
        endDate: newOKR.endDate
      };
      
      setCulturalOKRs(prev => prev.map(okr => 
        okr.id === selectedOKR.id ? updatedOKR : okr
      ));
      setShowEditOKRModal(false);
      setSelectedOKR(null);
      
      toast({
        title: "OKR Updated",
        description: `${updatedOKR.theme} OKR has been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update OKR",
        variant: "destructive"
      });
    }
  };

  const handleTrackProgress = (okr: CulturalOKR) => {
    setSelectedOKR(okr);
    setShowTrackProgressModal(true);
  };

  const handleUpdateProgress = async (targetIndex: number, newCurrent: number) => {
    try {
      if (!selectedOKR) return;
      
      const updatedTargets = [...selectedOKR.targets];
      updatedTargets[targetIndex] = {
        ...updatedTargets[targetIndex],
        current: newCurrent
      };
      
      const updatedOKR: CulturalOKR = {
        ...selectedOKR,
        targets: updatedTargets
      };
      
      setCulturalOKRs(prev => prev.map(okr => 
        okr.id === selectedOKR.id ? updatedOKR : okr
      ));
      setSelectedOKR(updatedOKR);
      
      toast({
        title: "Progress Updated",
        description: `Progress for ${updatedTargets[targetIndex].metric} has been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const addTarget = () => {
    setNewOKR(prev => ({
      ...prev,
      targets: [...prev.targets, { metric: '', current: 0, target: 0, unit: '' }]
    }));
  };

  const removeTarget = (index: number) => {
    setNewOKR(prev => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index)
    }));
  };

  const updateTarget = (index: number, field: string, value: any) => {
    setNewOKR(prev => ({
      ...prev,
      targets: prev.targets.map((target, i) => 
        i === index ? { ...target, [field]: value } : target
      )
    }));
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
                              <DropdownMenuItem 
                                onClick={() => handleEditAlertRule(rule)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleViewRecipients(rule)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Recipients</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteAlertRule(rule)}
                                className="cursor-pointer"
                              >
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

              <Button 
                onClick={() => handleSaveSettings('Survey')} 
                disabled={savingSettings}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingSettings ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Survey Settings</span>
                  </>
                )}
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
                <Button 
                  onClick={handleAddAdmin}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
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
                              <DropdownMenuItem 
                                onClick={() => handleEditRole(admin)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Role</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleManagePermissions(admin)}
                                className="cursor-pointer"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Manage Permissions</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRemoveAccess(admin)}
                                className="cursor-pointer"
                              >
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

              <Button 
                onClick={() => handleSaveSettings('Branding')} 
                disabled={savingSettings}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingSettings ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Branding Settings</span>
                  </>
                )}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-gray-50"
                              onClick={() => handleEditOKR(okr)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-gray-50"
                              onClick={() => handleTrackProgress(okr)}
                            >
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

        {/* Add Alert Rule Modal */}
        <Dialog open={showAddAlertModal} onOpenChange={setShowAddAlertModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="w-6 h-6 text-red-600" />
                <span>Add New Alert Rule</span>
              </DialogTitle>
              <DialogDescription>
                Create a new automated alert rule for organization monitoring
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Rule Name</Label>
                <Input 
                  placeholder="Enter rule name"
                  value={newAlertRule.name}
                  onChange={(e) => setNewAlertRule({...newAlertRule, name: e.target.value})}
                  className="hover:border-red-300 transition-colors duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Condition</Label>
                <Textarea 
                  placeholder="Describe the alert condition (e.g., More than 3 alerts in a week)"
                  value={newAlertRule.condition}
                  onChange={(e) => setNewAlertRule({...newAlertRule, condition: e.target.value})}
                  rows={3}
                  className="hover:border-red-300 transition-colors duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Threshold</Label>
                  <Input 
                    type="number"
                    value={newAlertRule.threshold}
                    onChange={(e) => setNewAlertRule({...newAlertRule, threshold: parseFloat(e.target.value)})}
                    className="hover:border-red-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Timeframe</Label>
                  <Select value={newAlertRule.timeframe} onValueChange={(value) => setNewAlertRule({...newAlertRule, timeframe: value})}>
                    <SelectTrigger className="hover:border-red-300 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Notification Type</Label>
                <Select value={newAlertRule.notificationType} onValueChange={(value: any) => setNewAlertRule({...newAlertRule, notificationType: value})}>
                  <SelectTrigger className="hover:border-red-300 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddAlertModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAlertRule}
                  disabled={!newAlertRule.name.trim() || !newAlertRule.condition.trim()}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Alert Rule Modal */}
        <Dialog open={showEditAlertModal} onOpenChange={setShowEditAlertModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-6 h-6 text-blue-600" />
                <span>Edit Alert Rule</span>
              </DialogTitle>
              <DialogDescription>
                Modify the alert rule configuration and settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Rule Name</Label>
                <Input 
                  placeholder="Enter rule name"
                  value={newAlertRule.name}
                  onChange={(e) => setNewAlertRule({...newAlertRule, name: e.target.value})}
                  className="hover:border-blue-300 transition-colors duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Condition</Label>
                <Textarea 
                  placeholder="Describe the alert condition"
                  value={newAlertRule.condition}
                  onChange={(e) => setNewAlertRule({...newAlertRule, condition: e.target.value})}
                  rows={3}
                  className="hover:border-blue-300 transition-colors duration-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Threshold</Label>
                  <Input 
                    type="number"
                    value={newAlertRule.threshold}
                    onChange={(e) => setNewAlertRule({...newAlertRule, threshold: parseFloat(e.target.value)})}
                    className="hover:border-blue-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Timeframe</Label>
                  <Select value={newAlertRule.timeframe} onValueChange={(value) => setNewAlertRule({...newAlertRule, timeframe: value})}>
                    <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Notification Type</Label>
                <Select value={newAlertRule.notificationType} onValueChange={(value: any) => setNewAlertRule({...newAlertRule, notificationType: value})}>
                  <SelectTrigger className="hover:border-blue-300 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditAlertModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateAlertRule}
                  disabled={!newAlertRule.name.trim() || !newAlertRule.condition.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Recipients Modal */}
        <Dialog open={showViewRecipientsModal} onOpenChange={setShowViewRecipientsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Eye className="w-6 h-6 text-green-600" />
                <span>View Recipients - {selectedAlertRule?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Manage who receives notifications for this alert rule
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Current Recipients</Label>
                <div className="space-y-2">
                  {selectedAlertRule?.recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">@</span>
                        </div>
                        <span className="font-medium text-gray-900">{recipient}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Add New Recipient</Label>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Enter email address"
                    className="flex-1 hover:border-green-300 transition-colors duration-200"
                  />
                  <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowViewRecipientsModal(false)}>
                  Close
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Alert Rule Modal */}
        <Dialog open={showDeleteAlertModal} onOpenChange={setShowDeleteAlertModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <span>Delete Alert Rule</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedAlertRule?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteAlertModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDeleteAlert}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Admin Modal */}
        <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserPlus className="w-6 h-6 text-green-600" />
                <span>Add New Admin</span>
              </DialogTitle>
              <DialogDescription>
                Create a new admin account with role and team assignments
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Name</Label>
                  <Input 
                    placeholder="Enter full name"
                    value={newAdminRole.name}
                    onChange={(e) => setNewAdminRole({...newAdminRole, name: e.target.value})}
                    className="hover:border-green-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Email</Label>
                  <Input 
                    placeholder="Enter email address"
                    value={newAdminRole.email}
                    onChange={(e) => setNewAdminRole({...newAdminRole, email: e.target.value})}
                    className="hover:border-green-300 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Role</Label>
                <Select value={newAdminRole.role} onValueChange={(value: any) => setNewAdminRole({...newAdminRole, role: value})}>
                  <SelectTrigger className="hover:border-green-300 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Assign Teams</Label>
                <div className="space-y-2">
                  {['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'].map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`team-${team}`}
                        checked={newAdminRole.teams.includes(team)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAdminRole({...newAdminRole, teams: [...newAdminRole.teams, team]});
                          } else {
                            setNewAdminRole({...newAdminRole, teams: newAdminRole.teams.filter(t => t !== team)});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`team-${team}`} className="text-sm">{team}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddAdminModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAdmin}
                  disabled={!newAdminRole.name.trim() || !newAdminRole.email.trim()}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Admin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Role Modal */}
        <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-6 h-6 text-purple-600" />
                <span>Edit Role - {selectedAdminRole?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Modify the admin role and team assignments
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Name</Label>
                  <Input 
                    value={newAdminRole.name}
                    onChange={(e) => setNewAdminRole({...newAdminRole, name: e.target.value})}
                    className="hover:border-purple-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Email</Label>
                  <Input 
                    value={newAdminRole.email}
                    onChange={(e) => setNewAdminRole({...newAdminRole, email: e.target.value})}
                    className="hover:border-purple-300 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Role</Label>
                <Select value={newAdminRole.role} onValueChange={(value: any) => setNewAdminRole({...newAdminRole, role: value})}>
                  <SelectTrigger className="hover:border-purple-300 transition-colors duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Assigned Teams</Label>
                <div className="space-y-2">
                  {['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'].map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-team-${team}`}
                        checked={newAdminRole.teams.includes(team)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAdminRole({...newAdminRole, teams: [...newAdminRole.teams, team]});
                          } else {
                            setNewAdminRole({...newAdminRole, teams: newAdminRole.teams.filter(t => t !== team)});
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`edit-team-${team}`} className="text-sm">{team}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditRoleModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateRole}
                  disabled={!newAdminRole.name.trim() || !newAdminRole.email.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Permissions Modal */}
        <Dialog open={showManagePermissionsModal} onOpenChange={setShowManagePermissionsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span>Manage Permissions - {selectedAdminRole?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Configure detailed permissions for this admin role
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Current Permissions</Label>
                <div className="space-y-2">
                  {selectedAdminRole?.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">{permission.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Available Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['view_all', 'create_surveys', 'manage_teams', 'view_team', 'export_data', 'manage_alerts'].map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`perm-${permission}`}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`perm-${permission}`} className="text-sm">{permission.replace('_', ' ').toUpperCase()}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowManagePermissionsModal(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Permissions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Remove Access Modal */}
        <Dialog open={showRemoveAccessModal} onOpenChange={setShowRemoveAccessModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserMinus className="w-6 h-6 text-red-600" />
                <span>Remove Access</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove access for "{selectedAdminRole?.name}"? They will no longer be able to access the platform.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRemoveAccessModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmRemoveAccess}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Remove Access
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add OKR Modal */}
        <Dialog open={showAddOKRModal} onOpenChange={setShowAddOKRModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-orange-600" />
                <span>Create New Cultural OKR</span>
              </DialogTitle>
              <DialogDescription>
                Define a new cultural objective with measurable targets and timeline
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Quarter</Label>
                  <Input 
                    placeholder="e.g., Q1 2024"
                    value={newOKR.quarter}
                    onChange={(e) => setNewOKR({...newOKR, quarter: e.target.value})}
                    className="hover:border-orange-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Theme</Label>
                  <Input 
                    placeholder="e.g., Employee Engagement"
                    value={newOKR.theme}
                    onChange={(e) => setNewOKR({...newOKR, theme: e.target.value})}
                    className="hover:border-orange-300 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Description</Label>
                <Textarea 
                  placeholder="Describe the cultural objective and its importance..."
                  value={newOKR.description}
                  onChange={(e) => setNewOKR({...newOKR, description: e.target.value})}
                  rows={3}
                  className="hover:border-orange-300 transition-colors duration-200"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Start Date</Label>
                  <Input 
                    type="date"
                    value={newOKR.startDate}
                    onChange={(e) => setNewOKR({...newOKR, startDate: e.target.value})}
                    className="hover:border-orange-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">End Date</Label>
                  <Input 
                    type="date"
                    value={newOKR.endDate}
                    onChange={(e) => setNewOKR({...newOKR, endDate: e.target.value})}
                    className="hover:border-orange-300 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-gray-900">Targets & Metrics</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addTarget}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Target</span>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newOKR.targets.map((target, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">Target {index + 1}</span>
                        {newOKR.targets.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeTarget(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Metric</Label>
                          <Input 
                            placeholder="e.g., Participation Rate"
                            value={target.metric}
                            onChange={(e) => updateTarget(index, 'metric', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Current</Label>
                          <Input 
                            type="number"
                            placeholder="0"
                            value={target.current}
                            onChange={(e) => updateTarget(index, 'current', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Target</Label>
                          <Input 
                            type="number"
                            placeholder="100"
                            value={target.target}
                            onChange={(e) => updateTarget(index, 'target', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Unit</Label>
                          <Input 
                            placeholder="%"
                            value={target.unit}
                            onChange={(e) => updateTarget(index, 'unit', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddOKRModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateOKR}
                  disabled={!newOKR.quarter.trim() || !newOKR.theme.trim() || !newOKR.description.trim()}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create OKR
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit OKR Modal */}
        <Dialog open={showEditOKRModal} onOpenChange={setShowEditOKRModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="w-6 h-6 text-purple-600" />
                <span>Edit OKR - {selectedOKR?.theme}</span>
              </DialogTitle>
              <DialogDescription>
                Modify the cultural objective and its targets
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Quarter</Label>
                  <Input 
                    value={newOKR.quarter}
                    onChange={(e) => setNewOKR({...newOKR, quarter: e.target.value})}
                    className="hover:border-purple-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Theme</Label>
                  <Input 
                    value={newOKR.theme}
                    onChange={(e) => setNewOKR({...newOKR, theme: e.target.value})}
                    className="hover:border-purple-300 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-semibold text-gray-900">Description</Label>
                <Textarea 
                  value={newOKR.description}
                  onChange={(e) => setNewOKR({...newOKR, description: e.target.value})}
                  rows={3}
                  className="hover:border-purple-300 transition-colors duration-200"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">Start Date</Label>
                  <Input 
                    type="date"
                    value={newOKR.startDate}
                    onChange={(e) => setNewOKR({...newOKR, startDate: e.target.value})}
                    className="hover:border-purple-300 transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-900">End Date</Label>
                  <Input 
                    type="date"
                    value={newOKR.endDate}
                    onChange={(e) => setNewOKR({...newOKR, endDate: e.target.value})}
                    className="hover:border-purple-300 transition-colors duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-gray-900">Targets & Metrics</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addTarget}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Target</span>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newOKR.targets.map((target, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">Target {index + 1}</span>
                        {newOKR.targets.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeTarget(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Metric</Label>
                          <Input 
                            value={target.metric}
                            onChange={(e) => updateTarget(index, 'metric', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Current</Label>
                          <Input 
                            type="number"
                            value={target.current}
                            onChange={(e) => updateTarget(index, 'current', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Target</Label>
                          <Input 
                            type="number"
                            value={target.target}
                            onChange={(e) => updateTarget(index, 'target', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Unit</Label>
                          <Input 
                            value={target.unit}
                            onChange={(e) => updateTarget(index, 'unit', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditOKRModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateOKR}
                  disabled={!newOKR.quarter.trim() || !newOKR.theme.trim() || !newOKR.description.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Track Progress Modal */}
        <Dialog open={showTrackProgressModal} onOpenChange={setShowTrackProgressModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span>Track Progress - {selectedOKR?.theme}</span>
              </DialogTitle>
              <DialogDescription>
                Update progress for each target and monitor achievement
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">{selectedOKR?.quarter}</h3>
                </div>
                <p className="text-blue-800 text-sm">{selectedOKR?.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-blue-700">
                  <span>Duration: {selectedOKR?.startDate && new Date(selectedOKR.startDate).toLocaleDateString()} - {selectedOKR?.endDate && new Date(selectedOKR.endDate).toLocaleDateString()}</span>
                  <Badge className={getStatusColor(selectedOKR?.status || 'draft')}>
                    {selectedOKR?.status?.charAt(0).toUpperCase() + selectedOKR?.status?.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="font-semibold text-gray-900">Target Progress</Label>
                {selectedOKR?.targets.map((target, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{target.metric}</h4>
                        <p className="text-sm text-gray-600">Target: {target.target}{target.unit}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{target.current}</div>
                        <div className="text-sm text-gray-500">Current</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{Math.round((target.current / target.target) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((target.current / target.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Label className="text-sm font-medium">Update Current Value:</Label>
                        <Input 
                          type="number"
                          value={target.current}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            handleUpdateProgress(index, newValue);
                          }}
                          className="w-24 text-sm"
                          min="0"
                          max={target.target * 2}
                        />
                        <span className="text-sm text-gray-500">{target.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTrackProgressModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => setShowTrackProgressModal(false)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OwnerSettings; 