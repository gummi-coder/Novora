
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Alert settings type
interface AlertSettingsType {
  id: string;
  name: string;
  metric: string;
  condition: ">" | "<" | "=";
  threshold: number;
  severity: "info" | "warning" | "critical";
  enabled: boolean;
}

// Notification settings type
interface NotificationSettings {
  inApp: boolean;
  email: boolean;
  recipients: string[];
}

export function AlertSettingsForm() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = React.useState("thresholds");
  
  // Mock alert types for demonstration
  const [alertTypes, setAlertTypes] = React.useState<AlertSettingsType[]>([
    {
      id: "1",
      name: "Low Response Rate",
      metric: "Response Rate",
      condition: "<",
      threshold: 50,
      severity: "warning",
      enabled: true
    },
    {
      id: "2",
      name: "eNPS Critical Drop",
      metric: "eNPS",
      condition: "<",
      threshold: 0,
      severity: "critical",
      enabled: true
    },
    {
      id: "3",
      name: "Team Satisfaction Drop",
      metric: "Job Satisfaction",
      condition: "<",
      threshold: 70,
      severity: "warning",
      enabled: true
    }
  ]);

  // Mock notification settings
  const [notifications, setNotifications] = React.useState<NotificationSettings>({
    inApp: true,
    email: true,
    recipients: ["team-leads@company.com", "admin@company.com"]
  });

  // New custom alert state
  const [newAlert, setNewAlert] = React.useState<Omit<AlertSettingsType, "id">>({
    name: "",
    metric: "Response Rate",
    condition: "<",
    threshold: 50,
    severity: "warning",
    enabled: true
  });

  // Update existing alert setting
  const handleAlertUpdate = (id: string, field: string, value: any) => {
    setAlertTypes(
      alertTypes.map((alert) => 
        alert.id === id ? { ...alert, [field]: value } : alert
      )
    );
  };

  // Toggle alert enabled status
  const toggleAlertEnabled = (id: string) => {
    setAlertTypes(
      alertTypes.map((alert) => 
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  // Toggle notification channel
  const toggleNotification = (channel: "inApp" | "email") => {
    setNotifications({
      ...notifications,
      [channel]: !notifications[channel]
    });
  };

  // Handle recipient changes
  const handleRecipientsChange = (value: string) => {
    setNotifications({
      ...notifications,
      recipients: value.split(",").map(email => email.trim())
    });
  };

  // Handle new alert input changes
  const handleNewAlertChange = (field: string, value: any) => {
    setNewAlert({
      ...newAlert,
      [field]: value
    });
  };

  // Create new custom alert
  const handleCreateAlert = () => {
    // Validate form
    if (!newAlert.name || !newAlert.metric) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }

    // Add new alert
    const newAlertWithId = {
      ...newAlert,
      id: (alertTypes.length + 1).toString()
    };
    
    setAlertTypes([...alertTypes, newAlertWithId]);
    
    // Reset form
    setNewAlert({
      name: "",
      metric: "Response Rate",
      condition: "<",
      threshold: 50,
      severity: "warning",
      enabled: true
    });

    toast({
      title: "Alert created",
      description: `${newAlert.name} alert has been created successfully`
    });
  };

  // Save all settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your alert settings have been saved successfully"
    });
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    // Here you would reset to your application defaults
    toast({
      title: "Reset to defaults",
      description: "All settings have been reset to default values"
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Alert Settings</h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="custom">Custom Alerts</TabsTrigger>
        </TabsList>
        
        {/* Thresholds Tab */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>Configure when alerts should be triggered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertTypes.map((alert) => (
                  <div key={alert.id} className="grid grid-cols-12 gap-4 items-center border-b pb-4">
                    <div className="col-span-3">
                      <Label htmlFor={`name-${alert.id}`}>Alert Name</Label>
                      <Input
                        id={`name-${alert.id}`}
                        value={alert.name}
                        onChange={(e) => handleAlertUpdate(alert.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`metric-${alert.id}`}>Metric</Label>
                      <Select 
                        value={alert.metric} 
                        onValueChange={(value) => handleAlertUpdate(alert.id, "metric", value)}
                      >
                        <SelectTrigger id={`metric-${alert.id}`}>
                          <SelectValue placeholder="Metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Response Rate">Response Rate</SelectItem>
                          <SelectItem value="eNPS">eNPS</SelectItem>
                          <SelectItem value="Job Satisfaction">Job Satisfaction</SelectItem>
                          <SelectItem value="Team Engagement">Team Engagement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Label htmlFor={`condition-${alert.id}`}>Condition</Label>
                      <Select 
                        value={alert.condition} 
                        onValueChange={(value) => handleAlertUpdate(alert.id, "condition", value as ">" | "<" | "=")}
                      >
                        <SelectTrigger id={`condition-${alert.id}`}>
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<">Less than</SelectItem>
                          <SelectItem value=">">Greater than</SelectItem>
                          <SelectItem value="=">Equal to</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`threshold-${alert.id}`}>Threshold</Label>
                      <Input
                        id={`threshold-${alert.id}`}
                        type="number"
                        value={alert.threshold}
                        onChange={(e) => handleAlertUpdate(alert.id, "threshold", Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`severity-${alert.id}`}>Severity</Label>
                      <Select 
                        value={alert.severity} 
                        onValueChange={(value) => handleAlertUpdate(alert.id, "severity", value as "info" | "warning" | "critical")}
                      >
                        <SelectTrigger id={`severity-${alert.id}`}>
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`enabled-${alert.id}`}
                          checked={alert.enabled}
                          onCheckedChange={() => toggleAlertEnabled(alert.id)}
                        />
                        <Label htmlFor={`enabled-${alert.id}`}>
                          {alert.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetDefaults}>Reset to Defaults</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive alert notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <p className="text-sm text-muted-foreground mb-4">Select how you want to receive notifications</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="in-app">In-app notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts within the dashboard</p>
                    </div>
                    <Switch
                      id="in-app"
                      checked={notifications.inApp}
                      onCheckedChange={() => toggleNotification("inApp")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email">Email notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch
                      id="email"
                      checked={notifications.email}
                      onCheckedChange={() => toggleNotification("email")}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Recipients</h3>
                <p className="text-sm text-muted-foreground mb-4">Who should receive alert notifications</p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipients">Email addresses (comma separated)</Label>
                    <Input
                      id="recipients"
                      placeholder="e.g. admin@company.com, manager@company.com"
                      value={notifications.recipients.join(", ")}
                      onChange={(e) => handleRecipientsChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetDefaults}>Reset to Defaults</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Custom Alerts Tab */}
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Alert</CardTitle>
              <CardDescription>Configure your own custom alert thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-name">Alert Name</Label>
                    <Input
                      id="alert-name"
                      placeholder="E.g. Critical Response Drop"
                      value={newAlert.name}
                      onChange={(e) => handleNewAlertChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-metric">Metric</Label>
                    <Select 
                      value={newAlert.metric}
                      onValueChange={(value) => handleNewAlertChange("metric", value)}
                    >
                      <SelectTrigger id="alert-metric">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Response Rate">Response Rate</SelectItem>
                        <SelectItem value="eNPS">eNPS</SelectItem>
                        <SelectItem value="Job Satisfaction">Job Satisfaction</SelectItem>
                        <SelectItem value="Team Engagement">Team Engagement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-condition">Condition</Label>
                    <Select 
                      value={newAlert.condition}
                      onValueChange={(value) => handleNewAlertChange("condition", value as ">" | "<" | "=")}
                    >
                      <SelectTrigger id="alert-condition">
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<">Less than</SelectItem>
                        <SelectItem value=">">Greater than</SelectItem>
                        <SelectItem value="=">Equal to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-threshold">Threshold Value</Label>
                    <Input
                      id="alert-threshold"
                      type="number"
                      value={newAlert.threshold}
                      onChange={(e) => handleNewAlertChange("threshold", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-severity">Severity</Label>
                    <Select 
                      value={newAlert.severity}
                      onValueChange={(value) => handleNewAlertChange("severity", value as "info" | "warning" | "critical")}
                    >
                      <SelectTrigger id="alert-severity">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setNewAlert({
                name: "",
                metric: "Response Rate",
                condition: "<",
                threshold: 50,
                severity: "warning",
                enabled: true
              })}>
                Clear Form
              </Button>
              <Button onClick={handleCreateAlert}>Create Alert</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
