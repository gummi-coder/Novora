import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Building,
  Users,
  Shield,
  Bell,
  FileText,
  Download,
  CreditCard,
  Lock,
  Save,
  RotateCcw,
  Mail,
  Slack,
  Zap,
  FileCheck,
  Plus
} from 'lucide-react';
import { AlertConfiguration } from './AlertConfiguration';

interface OrganizationSettings {
  companyName: string;
  locale: string;
  timezone: string;
  accentColor: string;
  customLogo?: string; // URL for custom logo
  allowCustomLogo: boolean; // Whether custom logo is allowed
  dataRetention: {
    rawComments: number;
    aggregates: number;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    viewDashboards: boolean;
    manageSurveys: boolean;
    seeComments: boolean;
    acknowledgeAlerts: boolean;
    exportData: boolean;
    manageBilling: boolean;
  };
}

interface PrivacySettings {
  minResponses: number;
  autoRedactPII: boolean;
  profanityFilter: boolean;
  commentVisibility: 'admin' | 'manager' | 'viewer';
  dataResidency: string;
}

interface SurveyDefaults {
  cadence: string;
  language: string;
  defaultDrivers: string[];
  reminders: {
    count: number;
    spacing: number;
  };
  contactMethod: string;
}

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Settings component mounted successfully');
  }, []);

  // Organization Settings
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    companyName: 'Acme Corporation',
    locale: 'en-US',
    timezone: 'America/New_York',
    accentColor: '#3B82F6',
    customLogo: undefined,
    allowCustomLogo: true, // Allow custom logo for demonstration
    dataRetention: {
      rawComments: 12,
      aggregates: 60
    }
  });

  // Roles & Permissions
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full organization access',
      permissions: {
        viewDashboards: true,
        manageSurveys: true,
        seeComments: true,
        acknowledgeAlerts: true,
        exportData: true,
        manageBilling: true
      }
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Team-level access',
      permissions: {
        viewDashboards: true,
        manageSurveys: true,
        seeComments: true,
        acknowledgeAlerts: true,
        exportData: false,
        manageBilling: false
      }
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: {
        viewDashboards: true,
        manageSurveys: false,
        seeComments: false,
        acknowledgeAlerts: false,
        exportData: false,
        manageBilling: false
      }
    }
  ]);

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    minResponses: 4,
    autoRedactPII: true,
    profanityFilter: true,
    commentVisibility: 'manager',
    dataResidency: 'US'
  });

  // Survey Defaults
  const [surveyDefaults, setSurveyDefaults] = useState<SurveyDefaults>({
    cadence: 'monthly',
    language: 'en',
    defaultDrivers: ['leadership', 'communication', 'recognition'],
    reminders: {
      count: 2,
      spacing: 48
    },
    contactMethod: 'email'
  });

  // Integrations
  const [integrations] = useState<Integration[]>([
    { id: 'slack', name: 'Slack', status: 'connected', icon: Slack },
    { id: 'teams', name: 'Microsoft Teams', status: 'disconnected', icon: Zap },
    { id: 'email', name: 'Email Provider', status: 'connected', icon: Mail }
  ]);

  // Audit Log
  const [auditLog] = useState([
    { id: 1, user: 'admin@acme.com', action: 'Updated privacy settings', timestamp: '2024-08-08 14:30', details: 'Changed min responses from 3 to 4' },
    { id: 2, user: 'hr@acme.com', action: 'Modified alert thresholds', timestamp: '2024-08-07 09:15', details: 'Updated critical low score threshold' },
    { id: 3, user: 'admin@acme.com', action: 'Connected Slack integration', timestamp: '2024-08-06 16:45', details: 'Slack workspace connected successfully' }
  ]);

  const updateOrgSettings = (updates: Partial<OrganizationSettings>) => {
    setOrgSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
    
    // Save logo settings to localStorage for immediate UI updates
    if (updates.customLogo !== undefined) {
      if (updates.customLogo) {
        localStorage.setItem('novora_custom_logo', updates.customLogo);
      } else {
        localStorage.removeItem('novora_custom_logo');
      }
    }
    if (updates.allowCustomLogo !== undefined) {
      localStorage.setItem('novora_allow_custom_logo', updates.allowCustomLogo.toString());
    }
  };

  const updateRolePermissions = (roleId: string, permission: string, value: boolean) => {
    setRoles(prev => prev.map(role => 
      role.id === roleId 
        ? { ...role, permissions: { ...role.permissions, [permission]: value } }
        : role
    ));
    setHasChanges(true);
  };

  const updatePrivacySettings = (updates: Partial<PrivacySettings>) => {
    setPrivacySettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateSurveyDefaults = (updates: Partial<SurveyDefaults>) => {
    setSurveyDefaults(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHasChanges(false);
      toast({
        title: 'Settings Saved',
        description: 'All configuration changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setHasChanges(true);
    toast({
      title: 'Reset to Defaults',
      description: 'All settings have been reset to their default values.',
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Settings Management Board */}
      <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                <Lock className="w-6 h-6 text-gray-700" />
                Settings Management
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Configure Novora once and forget it. Privacy-first, simple, and actionable.
              </CardDescription>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={resetToDefaults} 
                disabled={saving}
                className="border-gray-200 bg-white/50 backdrop-blur-sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={saveSettings} 
                disabled={!hasChanges || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 bg-gray-100/50 border border-gray-200">
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="hidden lg:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden lg:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden lg:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="surveys" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Surveys</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span className="hidden lg:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden lg:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Exports</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden lg:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Building className="w-6 h-6 text-gray-700" />
                      Company Profile
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Basic organization information and branding
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={orgSettings.companyName}
                      onChange={(e) => updateOrgSettings({ companyName: e.target.value })}
                      className="border-gray-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locale">Locale</Label>
                    <Select value={orgSettings.locale} onValueChange={(value) => updateOrgSettings({ locale: value })}>
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                        <SelectItem value="fr-FR">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select value={orgSettings.timezone} onValueChange={(value) => updateOrgSettings({ timezone: value })}>
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={orgSettings.accentColor}
                        onChange={(e) => updateOrgSettings({ accentColor: e.target.value })}
                        className="w-16 h-10 border-gray-200 bg-white/50 backdrop-blur-sm"
                      />
                      <Input
                        value={orgSettings.accentColor}
                        onChange={(e) => updateOrgSettings({ accentColor: e.target.value })}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>

                {/* Demo Toggle for Custom Logo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Custom Logo Feature</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateOrgSettings({ allowCustomLogo: !orgSettings.allowCustomLogo })}
                      className="border-gray-200 bg-white/50 backdrop-blur-sm"
                    >
                      {orgSettings.allowCustomLogo ? 'Disable' : 'Enable'} Custom Logo
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Toggle to {orgSettings.allowCustomLogo ? 'hide' : 'show'} the custom logo upload option below.
                  </p>
                </div>

                {/* Logo Customization */}
                {orgSettings.allowCustomLogo && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Company Logo</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Custom Branding
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        {/* Current Logo Preview */}
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-200">
                          {orgSettings.customLogo ? (
                            <img 
                              src={orgSettings.customLogo} 
                              alt="Company Logo" 
                              className="w-12 h-12 object-contain rounded-lg"
                            />
                          ) : (
                            <img 
                              src="/favicon.png" 
                              alt="Novora Logo" 
                              className="w-12 h-12 object-contain"
                            />
                          )}
                        </div>
                        
                        {/* Logo Upload */}
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="customLogo">Upload Custom Logo</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="customLogo"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    updateOrgSettings({ customLogo: event.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="border-gray-200 bg-white/50 backdrop-blur-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateOrgSettings({ customLogo: undefined })}
                              className="border-gray-200 bg-white/50 backdrop-blur-sm"
                            >
                              Reset to Default
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Recommended: 64x64px PNG or SVG. Max 2MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-semibold">Data Retention Policy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="rawComments">Raw Comments (months)</Label>
                      <Select 
                        value={orgSettings.dataRetention.rawComments.toString()} 
                        onValueChange={(value) => updateOrgSettings({ 
                          dataRetention: { ...orgSettings.dataRetention, rawComments: parseInt(value) }
                        })}
                      >
                        <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aggregates">Aggregates (months)</Label>
                      <Select 
                        value={orgSettings.dataRetention.aggregates.toString()} 
                        onValueChange={(value) => updateOrgSettings({ 
                          dataRetention: { ...orgSettings.dataRetention, aggregates: parseInt(value) }
                        })}
                      >
                        <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                          <SelectItem value="120">120 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Users className="w-6 h-6 text-gray-700" />
                      Employee Management
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Upload and manage employee lists for survey delivery
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Admin Only
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Privacy Notice */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Privacy-First Employee Management</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Only Admins can see employee identifiers. Managers see only aggregates to protect anonymity.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Upload & Integration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Upload Employee List</CardTitle>
                      <CardDescription>Import employees from CSV or integrate with HR systems</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Upload CSV File</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".csv,.xlsx"
                            className="border-gray-200 bg-white/50 backdrop-blur-sm"
                          />
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Template
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          CSV format: Name, Email, Team, Status (Active/Inactive)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Integration Options</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="hris-integration" className="rounded" />
                            <Label htmlFor="hris-integration" className="text-sm">HRIS Integration (Workday, BambooHR)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="sso-integration" className="rounded" />
                            <Label htmlFor="sso-integration" className="text-sm">SSO/SCIM Sync (Okta, Azure AD)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="manual-add" className="rounded" />
                            <Label htmlFor="manual-add" className="text-sm">Manual Add/Edit</Label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4 mr-2" />
                          Manage Teams
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Survey Delivery</CardTitle>
                      <CardDescription>Configure how surveys are delivered to employees</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Delivery Channels</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="email-delivery" className="rounded" defaultChecked />
                            <Label htmlFor="email-delivery" className="text-sm">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="slack-delivery" className="rounded" />
                            <Label htmlFor="slack-delivery" className="text-sm">Slack</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="teams-delivery" className="rounded" />
                            <Label htmlFor="teams-delivery" className="text-sm">Microsoft Teams</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Delivery Settings</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Send reminders</span>
                            <Select defaultValue="2">
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Reminder timing</span>
                            <Select defaultValue="24h">
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12h">12h</SelectItem>
                                <SelectItem value="24h">24h</SelectItem>
                                <SelectItem value="48h">48h</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Employee Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-gray-200 bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">156</div>
                        <div className="text-sm text-muted-foreground">Total Employees</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-green-600">142 Active</span> • <span className="text-gray-500">14 Inactive</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">8</div>
                        <div className="text-sm text-muted-foreground">Teams</div>
                        <div className="text-xs text-gray-500 mt-1">Across organization</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">91%</div>
                        <div className="text-sm text-muted-foreground">Active Rate</div>
                        <div className="text-xs text-gray-500 mt-1">142 of 156 employees</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Team Distribution */}
                <Card className="border border-gray-200 bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Team Distribution</CardTitle>
                    <CardDescription>Current employee distribution across teams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { team: 'Engineering', count: 45, percentage: 29, color: 'bg-blue-500' },
                        { team: 'Sales', count: 32, percentage: 21, color: 'bg-green-500' },
                        { team: 'Marketing', count: 28, percentage: 18, color: 'bg-purple-500' },
                        { team: 'HR', count: 18, percentage: 12, color: 'bg-orange-500' },
                        { team: 'Finance', count: 15, percentage: 10, color: 'bg-red-500' },
                        { team: 'Operations', count: 18, percentage: 12, color: 'bg-yellow-500' }
                      ].map((teamData, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${teamData.color}`}></div>
                            <span className="font-medium">{teamData.team}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">{teamData.percentage}%</div>
                            <div className="font-semibold">{teamData.count}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Last synced: 2 hours ago • Next sync: 6 hours
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Employee List
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      View All Employees
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Users className="w-6 h-6 text-gray-700" />
                      Roles & Permissions
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Configure role-based access control and permissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4 bg-white/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{role.name}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <Badge variant={role.id === 'admin' ? 'default' : 'secondary'}>
                          {role.id === 'admin' ? 'Default' : 'Custom'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(role.permissions).map(([permission, enabled]) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => updateRolePermissions(role.id, permission, checked)}
                              disabled={role.id === 'admin'}
                            />
                            <Label className="text-sm">
                              {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Anonymity Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Shield className="w-6 h-6 text-gray-700" />
                      Privacy & Anonymity
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Configure data privacy and anonymity settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minResponses">Minimum Responses (min-n)</Label>
                    <Select 
                      value={privacySettings.minResponses.toString()} 
                      onValueChange={(value) => updatePrivacySettings({ minResponses: parseInt(value) })}
                    >
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} responses</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Data is only shown when this many responses are received</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commentVisibility">Who can view comments</Label>
                    <Select 
                      value={privacySettings.commentVisibility} 
                      onValueChange={(value: 'admin' | 'manager' | 'viewer') => updatePrivacySettings({ commentVisibility: value })}
                    >
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admins only</SelectItem>
                        <SelectItem value="manager">Managers & Admins</SelectItem>
                        <SelectItem value="viewer">All roles (respecting min-n)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Data Protection</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.autoRedactPII}
                        onCheckedChange={(checked) => updatePrivacySettings({ autoRedactPII: checked })}
                      />
                      <Label>Auto-redact emails, phone numbers, and PII</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.profanityFilter}
                        onCheckedChange={(checked) => updatePrivacySettings({ profanityFilter: checked })}
                      />
                      <Label>Enable profanity and PII filter</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataResidency">Data Residency</Label>
                  <Select 
                    value={privacySettings.dataResidency} 
                    onValueChange={(value) => updatePrivacySettings({ dataResidency: value })}
                  >
                    <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="EU">European Union</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts & Thresholds Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Bell className="w-6 h-6 text-gray-700" />
                      Alerts & Thresholds
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Configure early warning system and alert rules
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AlertConfiguration />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Survey Defaults Tab */}
          <TabsContent value="surveys" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <FileText className="w-6 h-6 text-gray-700" />
                      Survey Defaults
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Configure default survey settings and cadence
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cadence">Survey Cadence</Label>
                    <Select 
                      value={surveyDefaults.cadence} 
                      onValueChange={(value) => updateSurveyDefaults({ cadence: value })}
                    >
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
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
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select 
                      value={surveyDefaults.language} 
                      onValueChange={(value) => updateSurveyDefaults({ language: value })}
                    >
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactMethod">Employee Contact Method</Label>
                    <Select 
                      value={surveyDefaults.contactMethod} 
                      onValueChange={(value) => updateSurveyDefaults({ contactMethod: value })}
                    >
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminders">Reminder Count</Label>
                    <Select 
                      value={surveyDefaults.reminders.count.toString()} 
                      onValueChange={(value) => updateSurveyDefaults({ 
                        reminders: { ...surveyDefaults.reminders, count: parseInt(value) }
                      })}
                    >
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 reminder</SelectItem>
                        <SelectItem value="2">2 reminders</SelectItem>
                        <SelectItem value="3">3 reminders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates & Question Bank Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <FileCheck className="w-6 h-6 text-gray-700" />
                      Templates & Question Bank Governance
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Manage survey templates and question approval workflow
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Organization Templates</h4>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Lock organization templates (require admin approval for changes)</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Question Bank Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Core Drivers</h5>
                      <p className="text-sm text-gray-600">Leadership, Communication, Recognition</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Custom Sets</h5>
                      <p className="text-sm text-gray-600">Department-specific questions</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Approval Workflow</h4>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label>Require admin approval for new custom questions</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Zap className="w-6 h-6 text-gray-700" />
                      Integrations
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Connect with your existing tools and platforms
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-6 h-6" />
                          <div>
                            <h4 className="font-semibold">{integration.name}</h4>
                            <p className="text-sm text-gray-600">
                              {integration.status === 'connected' ? 'Connected' : 
                               integration.status === 'pending' ? 'Pending setup' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            integration.status === 'connected' ? 'default' : 
                            integration.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {integration.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="border-gray-200 bg-white/50 backdrop-blur-sm">
                            {integration.status === 'connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Mail className="w-6 h-6 text-gray-700" />
                      Notifications
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Configure notification preferences and delivery
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Digest Cadence</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quiet Hours</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No quiet hours</SelectItem>
                        <SelectItem value="evening">6 PM - 8 AM</SelectItem>
                        <SelectItem value="weekend">Weekends only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Real-time Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Alert notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Survey launch confirmations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Weekly summary reports</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports & Data Access Tab */}
          <TabsContent value="exports" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Download className="w-6 h-6 text-gray-700" />
                      Exports & Data Access
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Configure export settings and data access controls
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">PDF Style Presets</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Include Logo</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Include Footer</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">CSV Export Scopes</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Organization-wide data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Team-level data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Survey window data</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Shareable Links</h4>
                  <div className="space-y-2">
                    <Label>Token Expiry</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing & Subscription Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <CreditCard className="w-6 h-6 text-gray-700" />
                      Billing & Subscription
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Manage your subscription and billing information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
                    <h4 className="font-semibold">Current Plan</h4>
                    <p className="text-2xl font-bold text-blue-600">Enterprise</p>
                    <p className="text-sm text-gray-600">$99/month</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
                    <h4 className="font-semibold">Active Teams</h4>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-gray-600">of 15 seats used</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
                    <h4 className="font-semibold">Next Billing</h4>
                    <p className="text-2xl font-bold">Sep 15</p>
                    <p className="text-sm text-gray-600">Auto-renewal enabled</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Usage Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-gray-600">Surveys this month</p>
                      <p className="text-xl font-semibold">8</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-gray-600">Total responses</p>
                      <p className="text-xl font-semibold">1,247</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Update Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Audit Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-900">
                      <Lock className="w-6 h-6 text-gray-700" />
                      Security & Audit
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Security settings and audit trail
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Session Controls</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label>Enforce SSO for all users</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Session Timeout</Label>
                      <Select defaultValue="8">
                        <SelectTrigger className="border-gray-200 bg-white/50 backdrop-blur-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="8">8 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Audit Log</h4>
                  <div className="border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLog.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.user}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.timestamp}</TableCell>
                            <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Legal & Compliance</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-gray-200 bg-white/50 backdrop-blur-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Terms of Service
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-200 bg-white/50 backdrop-blur-sm">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Policy
                    </Button>
                    <Button variant="outline" className="w-full justify-start border-gray-200 bg-white/50 backdrop-blur-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download DPA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
