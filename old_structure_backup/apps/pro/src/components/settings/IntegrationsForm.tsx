
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { SettingSection } from "./SettingSection";
import { ApiKeyInput } from "./ApiKeyInput";
import { Button } from "@/components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ExternalLink, RefreshCw, Send, Trash2, Webhook, Zap } from "lucide-react";

// Mock integration data
const integrations = [
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Email delivery service for surveys and notifications",
    icon: "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/306_Twilio_Sendgrid_logo-512.png",
    connected: true,
    status: "active",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS delivery for surveys and notifications",
    icon: "https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/twilio-512.png",
    connected: false,
    status: "inactive",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send surveys and notifications to Slack channels",
    icon: "https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Slack_colored_svg-512.png",
    connected: true,
    status: "active",
  },
  {
    id: "msteams",
    name: "Microsoft Teams",
    description: "Send surveys and notifications to Teams channels",
    icon: "https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/microsoft_teams-512.png",
    connected: false,
    status: "inactive",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect EngagePulse to thousands of other apps",
    icon: "https://cdn1.iconfinder.com/data/icons/logos-companies-1/512/Zapier_logo-512.png",
    connected: true,
    status: "active",
  }
];

// Mock webhook data
const webhooks = [
  {
    id: "wh1",
    url: "https://example.com/hooks/survey-completed",
    events: ["survey.completed"],
    created: "2023-05-01T10:00:00Z",
    lastTriggered: "2023-05-10T14:30:00Z",
    status: "active",
  },
  {
    id: "wh2",
    url: "https://example.com/hooks/new-response",
    events: ["response.created"],
    created: "2023-05-02T11:20:00Z",
    lastTriggered: "2023-05-09T09:15:00Z",
    status: "active",
  }
];

// Mock activity logs
const activityLogs = [
  {
    id: "log1",
    timestamp: "2023-05-10T14:30:00Z",
    integration: "SendGrid",
    event: "Email Sent",
    status: "success",
    details: "Survey invitation sent to 25 recipients",
  },
  {
    id: "log2",
    timestamp: "2023-05-10T14:29:00Z",
    integration: "Slack",
    event: "Notification Sent",
    status: "success",
    details: "Survey completion notification sent to #hr-team",
  },
  {
    id: "log3",
    timestamp: "2023-05-09T09:15:00Z",
    integration: "Webhook",
    event: "Webhook Triggered",
    status: "success",
    details: "Webhook 'survey-completed' triggered successfully",
  },
  {
    id: "log4",
    timestamp: "2023-05-08T16:45:00Z",
    integration: "Zapier",
    event: "Zap Triggered",
    status: "error",
    details: "Failed to trigger zap: API rate limit exceeded",
  }
];

export function IntegrationsForm() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = React.useState("services");
  const [isSaving, setIsSaving] = React.useState(false);
  const [apiKeys, setApiKeys] = React.useState({
    sendgrid: "****************************************",
    twilio: "",
    slack: "xoxb-*********************************",
    msteams: "",
    zapier: "zap_*********************************",
  });
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [webhookEvents, setWebhookEvents] = React.useState<string[]>(["response.created"]);
  const [isLogOpen, setIsLogOpen] = React.useState(false);

  // Handle connect/disconnect integrations
  const handleConnectionToggle = (id: string, isConnected: boolean) => {
    setIsSaving(true);
    setTimeout(() => {
      toast({
        title: isConnected ? "Integration disconnected" : "Integration connected",
        description: `The ${id} integration has been ${isConnected ? "disconnected" : "connected"} successfully.`,
      });
      setIsSaving(false);
    }, 1000);
  };

  // Handle saving API key
  const handleSaveApiKey = (id: string, key: string) => {
    setIsSaving(true);
    setTimeout(() => {
      setApiKeys({ ...apiKeys, [id]: key });
      toast({
        title: "API key saved",
        description: `Your ${id} API key has been saved successfully.`,
      });
      setIsSaving(false);
    }, 1000);
  };

  // Handle test connection
  const handleTestConnection = (id: string) => {
    setIsSaving(true);
    setTimeout(() => {
      toast({
        title: "Connection successful",
        description: `The connection to ${id} was tested successfully.`,
      });
      setIsSaving(false);
    }, 1500);
  };

  // Handle adding new webhook
  const handleAddWebhook = () => {
    if (!webhookUrl) {
      toast({
        title: "Validation error",
        description: "Please enter a webhook URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      toast({
        title: "Webhook added",
        description: "Your webhook has been added successfully.",
      });
      setWebhookUrl("");
      setIsSaving(false);
    }, 1000);
  };

  // Handle deleting webhook
  const handleDeleteWebhook = (id: string) => {
    toast({
      title: "Webhook deleted",
      description: "The webhook has been deleted successfully.",
    });
  };

  // Handle testing webhook
  const handleTestWebhook = (id: string) => {
    setIsSaving(true);
    setTimeout(() => {
      toast({
        title: "Webhook tested",
        description: "Test event sent to webhook successfully.",
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Tabs 
        value={currentTab} 
        onValueChange={setCurrentTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* Integration Services */}
          {integrations.map((integration) => (
            <SettingSection
              key={integration.id}
              title={integration.name}
              description={integration.description}
              footer={
                <div className="flex justify-between w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={!integration.connected || isSaving}
                  >
                    Test Connection
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleConnectionToggle(integration.id, integration.connected)}
                    disabled={isSaving}
                    variant={integration.connected ? "outline" : "default"}
                  >
                    {integration.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              }
            >
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src={integration.icon} 
                  alt={`${integration.name} logo`}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant={integration.connected ? "default" : "outline"}>
                      {integration.connected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                </div>
              </div>

              {integration.id === "sendgrid" && (
                <div className="space-y-4">
                  <ApiKeyInput
                    label="SendGrid API Key"
                    value={apiKeys.sendgrid}
                    onChange={(value) => setApiKeys({ ...apiKeys, sendgrid: value })}
                    id="sendgrid-key"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="button"
                      onClick={() => handleSaveApiKey("sendgrid", apiKeys.sendgrid)}
                      disabled={isSaving}
                    >
                      Save API Key
                    </Button>
                  </div>
                </div>
              )}

              {integration.id === "twilio" && (
                <div className="space-y-4">
                  <ApiKeyInput
                    label="Twilio Account SID"
                    value={apiKeys.twilio}
                    onChange={(value) => setApiKeys({ ...apiKeys, twilio: value })}
                    id="twilio-sid"
                  />
                  <ApiKeyInput
                    label="Twilio Auth Token"
                    value=""
                    onChange={() => {}}
                    id="twilio-token"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="button"
                      onClick={() => handleSaveApiKey("twilio", apiKeys.twilio)}
                      disabled={isSaving}
                    >
                      Save API Keys
                    </Button>
                  </div>
                </div>
              )}

              {integration.id === "slack" && (
                <div className="space-y-4">
                  <ApiKeyInput
                    label="Slack Bot Token"
                    value={apiKeys.slack}
                    onChange={(value) => setApiKeys({ ...apiKeys, slack: value })}
                    id="slack-token"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="button"
                      onClick={() => handleSaveApiKey("slack", apiKeys.slack)}
                      disabled={isSaving}
                    >
                      Save Bot Token
                    </Button>
                  </div>
                </div>
              )}

              {integration.id === "msteams" && (
                <div className="space-y-4">
                  <ApiKeyInput
                    label="Microsoft Teams Webhook URL"
                    value={apiKeys.msteams}
                    onChange={(value) => setApiKeys({ ...apiKeys, msteams: value })}
                    id="teams-webhook"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="button"
                      onClick={() => handleSaveApiKey("msteams", apiKeys.msteams)}
                      disabled={isSaving}
                    >
                      Save Webhook URL
                    </Button>
                  </div>
                </div>
              )}

              {integration.id === "zapier" && (
                <div className="space-y-4">
                  <ApiKeyInput
                    label="Zapier API Key"
                    value={apiKeys.zapier}
                    onChange={(value) => setApiKeys({ ...apiKeys, zapier: value })}
                    id="zapier-key"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => window.open("https://zapier.com/apps/engagepulse", "_blank")}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open Zapier</span>
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => handleSaveApiKey("zapier", apiKeys.zapier)}
                      disabled={isSaving}
                    >
                      Save API Key
                    </Button>
                  </div>
                </div>
              )}
            </SettingSection>
          ))}
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          {/* Add New Webhook */}
          <SettingSection
            title="Add New Webhook"
            description="Configure webhooks to receive real-time events from EngagePulse"
            footer={
              <Button
                type="button"
                onClick={handleAddWebhook}
                disabled={!webhookUrl || isSaving}
                className="flex items-center gap-1"
              >
                <Webhook className="h-4 w-4" />
                <span>Add Webhook</span>
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Webhook URL</label>
                <Input
                  placeholder="https://your-service.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Webhook Events</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "survey.created",
                    "survey.published",
                    "survey.completed",
                    "response.created",
                    "report.generated"
                  ].map((event) => (
                    <Button
                      key={event}
                      type="button"
                      variant={webhookEvents.includes(event) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (webhookEvents.includes(event)) {
                          setWebhookEvents(webhookEvents.filter(e => e !== event));
                        } else {
                          setWebhookEvents([...webhookEvents, event]);
                        }
                      }}
                    >
                      {event}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Create a webhook endpoint on your server, then add it here to receive event notifications
                </p>
              </div>
            </div>
          </SettingSection>

          {/* Active Webhooks */}
          <SettingSection
            title="Active Webhooks"
            description="Manage your existing webhook endpoints"
          >
            {webhooks.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <p className="text-muted-foreground mb-2">No webhooks configured yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentTab("webhooks")}
                >
                  Add Your First Webhook
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div className="font-medium truncate max-w-[200px]">
                          {webhook.url}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={webhook.status === "active" ? "default" : "destructive"}>
                          {webhook.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                          >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Test</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SettingSection>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Logs */}
          <SettingSection
            title="Integration Activity"
            description="View recent activity from your connected integrations"
            footer={
              <div className="w-full flex justify-between">
                <Button variant="outline" onClick={() => setIsLogOpen(!isLogOpen)}>
                  {isLogOpen ? "Show Less" : "Show More"}
                </Button>
                <Button className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            }
          >
            <Collapsible
              open={isLogOpen}
              onOpenChange={setIsLogOpen}
              className="space-y-4"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Integration</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.slice(0, isLogOpen ? activityLogs.length : 2).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{log.integration}</span>
                      </TableCell>
                      <TableCell>{log.event}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === "success" ? "default" : "destructive"}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-muted-foreground text-sm">{log.details}</span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {activityLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No recent activity found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <CollapsibleContent>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Activity logs are retained for 30 days. For older logs, please export your data.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </SettingSection>

          {/* Integration Metrics */}
          <SettingSection
            title="Integration Metrics"
            description="Overview of your integration usage and performance"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-sm text-muted-foreground mb-1">API Calls (Last 24h)</h4>
                <p className="text-2xl font-bold">1,243</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full w-[45%]"></div>
                </div>
                <p className="text-xs mt-1 text-muted-foreground">45% of daily limit</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-sm text-muted-foreground mb-1">Webhook Deliveries (Last 24h)</h4>
                <p className="text-2xl font-bold">87</p>
                <div className="mt-2 flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    85 Successful
                  </Badge>
                  <Badge variant="destructive" className="text-xs">
                    2 Failed
                  </Badge>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-sm text-muted-foreground mb-1">Email Deliveries (Last 24h)</h4>
                <p className="text-2xl font-bold">547</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span>Open rate</span>
                    <span>62.4%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full w-[62%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </SettingSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
