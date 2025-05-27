
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { SettingSection } from "./SettingSection";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Download, Filter, RefreshCw, Search } from "lucide-react";

// Mock security data
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  expiryDays: 90,
  preventReuse: 5,
  lastChanged: "2023-04-15T10:30:00Z",
};

// Mock audit log data
const auditLogs = [
  {
    id: "log1",
    timestamp: "2023-05-10T15:45:00Z",
    user: "John Doe",
    action: "User Invited",
    resource: "jane.smith@example.com",
    ipAddress: "192.168.1.1",
  },
  {
    id: "log2",
    timestamp: "2023-05-10T14:30:00Z",
    user: "John Doe",
    action: "Survey Published",
    resource: "Q2 Engagement Survey",
    ipAddress: "192.168.1.1",
  },
  {
    id: "log3",
    timestamp: "2023-05-09T11:20:00Z",
    user: "Sarah Williams",
    action: "Settings Changed",
    resource: "Company Settings",
    ipAddress: "203.0.113.17",
  },
  {
    id: "log4",
    timestamp: "2023-05-08T09:15:00Z",
    user: "Michael Johnson",
    action: "Survey Created",
    resource: "Employee Feedback Survey",
    ipAddress: "198.51.100.42",
  },
  {
    id: "log5",
    timestamp: "2023-05-07T16:50:00Z",
    user: "Jane Cooper",
    action: "Report Generated",
    resource: "Monthly Engagement Report",
    ipAddress: "192.168.5.10",
  },
  {
    id: "log6",
    timestamp: "2023-05-06T13:25:00Z",
    user: "John Doe",
    action: "User Role Changed",
    resource: "Michael Johnson",
    ipAddress: "192.168.1.1",
  },
  {
    id: "log7",
    timestamp: "2023-05-05T10:05:00Z",
    user: "Sarah Williams",
    action: "Data Exported",
    resource: "Survey Responses",
    ipAddress: "203.0.113.17",
  },
];

export function SecurityForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAuditLogExpanded, setIsAuditLogExpanded] = React.useState(false);
  const [dataRetentionEnabled, setDataRetentionEnabled] = React.useState(true);
  const [retentionPeriod, setRetentionPeriod] = React.useState("365");

  // Data retention settings
  const [retentionSettings, setRetentionSettings] = React.useState({
    surveyResponses: true,
    surveyMetadata: true,
    userActivity: true,
    analyticsData: false,
  });

  // Handle data retention toggle
  const handleDataRetentionToggle = (checked: boolean) => {
    setDataRetentionEnabled(checked);
    toast({
      title: checked ? "Data retention enabled" : "Data retention disabled",
      description: checked 
        ? "Old data will be automatically deleted according to your settings" 
        : "Data will be retained indefinitely",
    });
  };

  // Handle data retention save
  const handleSaveRetention = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Retention settings saved",
        description: `Data will be retained for ${retentionPeriod} days.`,
      });
      setIsLoading(false);
    }, 1000);
  };

  // Handle GDPR data export
  const handleExportData = () => {
    toast({
      title: "Export requested",
      description: "Your data export is being prepared and will be emailed to you.",
    });
  };

  // Filter audit logs based on search query
  const filteredLogs = searchQuery
    ? auditLogs.filter(
        (log) =>
          log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : auditLogs;

  // Get displayed logs based on expanded state
  const displayedLogs = isAuditLogExpanded ? filteredLogs : filteredLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Password Policy */}
      <SettingSection
        title="Password Policy"
        description="Review your organization's password security requirements"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordPolicy.minLength >= 8} disabled />
                  <span>Minimum {passwordPolicy.minLength} characters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordPolicy.requireUppercase} disabled />
                  <span>At least one uppercase letter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordPolicy.requireNumbers} disabled />
                  <span>At least one number</span>
                </li>
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordPolicy.requireSpecialChars} disabled />
                  <span>At least one special character</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Policy Configuration</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Password expiration</span>
                  <span>{passwordPolicy.expiryDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Password history</span>
                  <span>Last {passwordPolicy.preventReuse} passwords</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last password change</span>
                  <span>{new Date(passwordPolicy.lastChanged).toLocaleDateString()}</span>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button variant="outline">Contact Admin to Change Policy</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* GDPR and Data Export */}
      <SettingSection
        title="Data Privacy & GDPR"
        description="Manage your data and export options for compliance"
      >
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Personal Data Export</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export all personal data associated with your account in compliance with GDPR and data privacy regulations.
            </p>
            <Button 
              onClick={handleExportData}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Request Data Export</span>
            </Button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Cookie and Tracking Preferences</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Control how we collect and use data about your usage of the platform.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Essential Cookies</p>
                  <p className="text-sm text-muted-foreground">Required for basic platform functionality</p>
                </div>
                <Switch checked disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics Cookies</p>
                  <p className="text-sm text-muted-foreground">Help us improve the platform through usage data</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Cookies</p>
                  <p className="text-sm text-muted-foreground">Allow personalized marketing and recommendations</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Data Retention */}
      <SettingSection
        title="Data Retention"
        description="Configure automatic data deletion policies"
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Automatic Data Retention</h3>
              <p className="text-sm text-muted-foreground">
                Automatically delete old data after a specified period
              </p>
            </div>
            <Switch 
              checked={dataRetentionEnabled} 
              onCheckedChange={handleDataRetentionToggle}
            />
          </div>

          {dataRetentionEnabled && (
            <>
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Retention Period</label>
                <div className="flex gap-4 items-center">
                  <Select
                    value={retentionPeriod}
                    onValueChange={setRetentionPeriod}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSaveRetention}>Save Setting</Button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <h4 className="text-sm font-medium">Data Types to Retain</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="survey-responses"
                      checked={retentionSettings.surveyResponses}
                      onCheckedChange={(checked) => 
                        setRetentionSettings({ ...retentionSettings, surveyResponses: !!checked })
                      }
                    />
                    <label
                      htmlFor="survey-responses"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Survey Responses
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="survey-metadata"
                      checked={retentionSettings.surveyMetadata}
                      onCheckedChange={(checked) => 
                        setRetentionSettings({ ...retentionSettings, surveyMetadata: !!checked })
                      }
                    />
                    <label
                      htmlFor="survey-metadata"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Survey Metadata
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="user-activity"
                      checked={retentionSettings.userActivity}
                      onCheckedChange={(checked) => 
                        setRetentionSettings({ ...retentionSettings, userActivity: !!checked })
                      }
                    />
                    <label
                      htmlFor="user-activity"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      User Activity Data
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="analytics-data"
                      checked={retentionSettings.analyticsData}
                      onCheckedChange={(checked) => 
                        setRetentionSettings({ ...retentionSettings, analyticsData: !!checked })
                      }
                    />
                    <label
                      htmlFor="analytics-data"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Analytics Data
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SettingSection>

      {/* Audit Log */}
      <SettingSection
        title="Audit Log"
        description="View user actions and system events"
        footer={
          <div className="w-full flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsAuditLogExpanded(!isAuditLogExpanded)}
            >
              {isAuditLogExpanded ? "Show Less" : "Show More"}
            </Button>
            <Button onClick={() => setSearchQuery("")} className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        }
      >
        <Collapsible
          open={true}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search audit logs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Resource</TableHead>
                <TableHead className="hidden md:table-cell">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {log.resource}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {log.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredLogs.length > 5 && !isAuditLogExpanded && (
            <div className="pt-2 text-center text-sm text-muted-foreground">
              Showing 5 of {filteredLogs.length} entries
            </div>
          )}

          {isAuditLogExpanded && (
            <CollapsibleContent>
              <div className="pt-2 flex justify-center">
                <Button variant="outline">Export Audit Log</Button>
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </SettingSection>
    </div>
  );
}
