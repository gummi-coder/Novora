import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Users,
  UserPlus,
  Shield,
  Bell,
  Palette,
  Upload,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Slack,
  MessageSquare,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  label: string;
  lead: string;
  memberCount: number;
  isActive: boolean;
}

interface SurveyRule {
  id: string;
  name: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  alertThreshold: number;
  openComments: boolean;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr_manager' | 'team_lead' | 'viewer';
  teams: string[];
  isActive: boolean;
  lastLogin?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'slack' | 'teams' | 'sso' | 'hris';
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  lastSync?: string;
}

interface Branding {
  logo?: string;
  companyName: string;
  tone: 'friendly' | 'formal' | 'professional';
  primaryColor: string;
  customMessage?: string;
}

const AdvancedCapabilities = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [saving, setSaving] = useState(false);
  
  // Data state
  const [teams, setTeams] = useState<Team[]>([]);
  const [surveyRules, setSurveyRules] = useState<SurveyRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [branding, setBranding] = useState<Branding>({
    companyName: 'Novora Company',
    tone: 'friendly',
    primaryColor: '#3b82f6'
  });

  // Form states
  const [newTeam, setNewTeam] = useState({ name: '', label: '', lead: '' });
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'hr_manager' as string, teams: [] as string[] });
  const [newSurveyRule, setNewSurveyRule] = useState({
    name: '',
    frequency: 'monthly' as string,
    alertThreshold: 20,
    openComments: true
  });

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        setLoading(true);
        
        // Mock teams data
        const mockTeams: Team[] = [
          {
            id: "1",
            name: "Engineering",
            label: "Product Development",
            lead: "Sarah Johnson",
            memberCount: 25,
            isActive: true
          },
          {
            id: "2",
            name: "Sales",
            label: "Revenue Generation",
            lead: "Mike Chen",
            memberCount: 18,
            isActive: true
          },
          {
            id: "3",
            name: "Marketing",
            label: "Brand & Growth",
            lead: "Emily Davis",
            memberCount: 12,
            isActive: true
          },
          {
            id: "4",
            name: "Support",
            label: "Customer Success",
            lead: "Alex Rodriguez",
            memberCount: 15,
            isActive: false
          }
        ];
        setTeams(mockTeams);

        // Mock survey rules data
        const mockSurveyRules: SurveyRule[] = [
          {
            id: "1",
            name: "Monthly Employee Satisfaction",
            frequency: 'monthly',
            alertThreshold: 15,
            openComments: true,
            isActive: true
          },
          {
            id: "2",
            name: "Quarterly Team Performance",
            frequency: 'quarterly',
            alertThreshold: 25,
            openComments: false,
            isActive: true
          },
          {
            id: "3",
            name: "Weekly Pulse Check",
            frequency: 'weekly',
            alertThreshold: 10,
            openComments: true,
            isActive: false
          }
        ];
        setSurveyRules(mockSurveyRules);

        // Mock users data
        const mockUsers: User[] = [
          {
            id: "1",
            email: "hr@novora.com",
            name: "Jennifer Smith",
            role: 'hr_manager',
            teams: ["Engineering", "Sales", "Marketing"],
            isActive: true,
            lastLogin: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: "2",
            email: "sarah.johnson@novora.com",
            name: "Sarah Johnson",
            role: 'team_lead',
            teams: ["Engineering"],
            isActive: true,
            lastLogin: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: "3",
            email: "mike.chen@novora.com",
            name: "Mike Chen",
            role: 'team_lead',
            teams: ["Sales"],
            isActive: true,
            lastLogin: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setUsers(mockUsers);

        // Mock integrations data
        const mockIntegrations: Integration[] = [
          {
            id: "1",
            name: "Slack",
            type: 'slack',
            status: 'connected',
            config: { channel: '#team-sentiment', notifications: true },
            lastSync: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: "2",
            name: "Microsoft Teams",
            type: 'teams',
            status: 'disconnected',
            config: {},
            lastSync: undefined
          },
          {
            id: "3",
            name: "SSO (Azure AD)",
            type: 'sso',
            status: 'error',
            config: { provider: 'azure', domain: 'novora.com' },
            lastSync: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setIntegrations(mockIntegrations);
        
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

  const addTeam = () => {
    if (!newTeam.name || !newTeam.label || !newTeam.lead) {
      toast({
        title: "Validation Error",
        description: "Please fill in all team fields",
        variant: "destructive"
      });
      return;
    }

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      label: newTeam.label,
      lead: newTeam.lead,
      memberCount: 0,
      isActive: true
    };

    setTeams(prev => [...prev, team]);
    setNewTeam({ name: '', label: '', lead: '' });
    
    toast({
      title: "Team Added",
      description: `Team "${team.name}" has been created successfully`,
    });
  };

  const removeTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
    toast({
      title: "Team Removed",
      description: "Team has been removed successfully",
    });
  };

  const addUser = () => {
    if (!newUser.email || !newUser.name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all user fields",
        variant: "destructive"
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
      teams: newUser.teams,
      isActive: true
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ email: '', name: '', role: 'hr_manager', teams: [] });
    
    toast({
      title: "User Added",
      description: `User "${user.name}" has been added successfully`,
    });
  };

  const addSurveyRule = () => {
    if (!newSurveyRule.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a survey rule name",
        variant: "destructive"
      });
      return;
    }

    const rule: SurveyRule = {
      id: Date.now().toString(),
      name: newSurveyRule.name,
      frequency: newSurveyRule.frequency as any,
      alertThreshold: newSurveyRule.alertThreshold,
      openComments: newSurveyRule.openComments,
      isActive: true
    };

    setSurveyRules(prev => [...prev, rule]);
    setNewSurveyRule({ name: '', frequency: 'monthly', alertThreshold: 20, openComments: true });
    
    toast({
      title: "Survey Rule Added",
      description: `Survey rule "${rule.name}" has been created successfully`,
    });
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected',
            lastSync: integration.status === 'connected' ? undefined : new Date().toISOString()
          }
        : integration
    ));
    
    toast({
      title: "Integration Updated",
      description: "Integration status has been updated",
    });
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "All settings have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'hr_manager': return 'text-blue-600 bg-blue-100';
      case 'team_lead': return 'text-green-600 bg-green-100';
      case 'viewer': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Customize the platform per company needs and manage integrations</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="teams" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Teams & Org</span>
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Survey Rules</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Slack className="w-4 h-4" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Branding</span>
          </TabsTrigger>
        </TabsList>

        {/* Teams & Org Setup Tab */}
        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Add New Team</span>
              </CardTitle>
              <CardDescription>Create a new team and assign a team lead</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    placeholder="e.g., Engineering"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Label</Label>
                  <Input
                    placeholder="e.g., Product Development"
                    value={newTeam.label}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Lead</Label>
                  <Input
                    placeholder="e.g., Sarah Johnson"
                    value={newTeam.lead}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, lead: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addTeam} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage existing teams and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-500">{team.label}</p>
                      </div>
                      <Badge variant="outline">{team.lead}</Badge>
                      <span className="text-sm text-gray-500">{team.memberCount} members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={team.isActive ? "default" : "secondary"}>
                        {team.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeTeam(team.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Survey Rules Tab */}
        <TabsContent value="surveys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Add Survey Rule</span>
              </CardTitle>
              <CardDescription>Configure survey frequency and alert settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name</Label>
                  <Input
                    placeholder="e.g., Monthly Employee Satisfaction"
                    value={newSurveyRule.name}
                    onChange={(e) => setNewSurveyRule(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={newSurveyRule.frequency} onValueChange={(value) => setNewSurveyRule(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alert Threshold (%)</Label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={newSurveyRule.alertThreshold}
                    onChange={(e) => setNewSurveyRule(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Open Comments</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newSurveyRule.openComments}
                      onCheckedChange={(checked) => setNewSurveyRule(prev => ({ ...prev, openComments: checked }))}
                    />
                    <span className="text-sm">{newSurveyRule.openComments ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
              <Button onClick={addSurveyRule} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Survey Rule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Survey Rules</CardTitle>
              <CardDescription>Manage survey frequency and alert settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surveyRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{rule.frequency}</span>
                          <AlertTriangle className="w-4 h-4" />
                          <span>{rule.alertThreshold}% threshold</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.openComments ? "default" : "secondary"}>
                        {rule.openComments ? "Comments On" : "Comments Off"}
                      </Badge>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Add User</span>
              </CardTitle>
              <CardDescription>Add new HR managers and set their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="user@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="hr_manager">HR Manager</SelectItem>
                      <SelectItem value="team_lead">Team Lead</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addUser} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {user.teams.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {user.lastLogin && (
                        <span className="text-sm text-gray-500">
                          Last: {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Slack className="w-5 h-5" />
                <span>Integrations</span>
              </CardTitle>
              <CardDescription>Connect with external tools and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {integration.type === 'slack' && <Slack className="w-5 h-5 text-purple-600" />}
                        {integration.type === 'teams' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                        {integration.type === 'sso' && <Shield className="w-5 h-5 text-green-600" />}
                        <div>
                          <h4 className="font-medium text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-500">
                            {integration.status === 'connected' && integration.lastSync && 
                              `Last sync: ${new Date(integration.lastSync).toLocaleString()}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Button 
                        variant={integration.status === 'connected' ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleIntegration(integration.id)}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Company Branding</span>
              </CardTitle>
              <CardDescription>Customize the platform appearance and tone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center space-x-4">
                    {branding.logo ? (
                      <img src={branding.logo} alt="Company Logo" className="w-16 h-16 object-contain border rounded" />
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={branding.companyName}
                    onChange={(e) => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>

                {/* Tone Preference */}
                <div className="space-y-2">
                  <Label>Communication Tone</Label>
                  <Select value={branding.tone} onValueChange={(value) => setBranding(prev => ({ ...prev, tone: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly & Casual</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={branding.primaryColor}
                      onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <Label>Custom Welcome Message</Label>
                  <Textarea
                    value={branding.customMessage || ''}
                    onChange={(e) => setBranding(prev => ({ ...prev, customMessage: e.target.value }))}
                    placeholder="Enter a custom message to display to users..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedCapabilities; 