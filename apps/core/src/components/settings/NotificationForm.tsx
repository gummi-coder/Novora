
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SettingSection } from "./SettingSection";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Plus, User } from "lucide-react";

// Define form schema
const notificationFormSchema = z.object({
  inApp: z.boolean().default(true),
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  slack: z.boolean().default(false),
  doNotDisturbStart: z.string(),
  doNotDisturbEnd: z.string(),
  newSurveyResponses: z.boolean().default(true),
  lowResponseRate: z.boolean().default(true),
  significantEscoreChange: z.boolean().default(true),
  scheduledReportCompletion: z.boolean().default(true),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// Mock notification recipients data
const notificationRecipients = [
  {
    id: "1",
    name: "Jane Cooper",
    email: "jane.cooper@example.com",
    role: "Admin",
    notificationTypes: ["Survey Responses", "Alert Triggers", "Reports"],
  },
  {
    id: "2",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    role: "Manager",
    notificationTypes: ["Alert Triggers", "Reports"],
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    role: "Team Lead",
    notificationTypes: ["Survey Responses"],
  },
];

export function NotificationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Set up days of the week for Do Not Disturb
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [selectedDays, setSelectedDays] = React.useState<string[]>(["Saturday", "Sunday"]);
  
  // Set up form
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      inApp: true,
      email: true,
      sms: false,
      slack: false,
      doNotDisturbStart: "18:00",
      doNotDisturbEnd: "09:00",
      newSurveyResponses: true,
      lowResponseRate: true,
      significantEscoreChange: true,
      scheduledReportCompletion: true,
    },
  });

  // Handle form submission
  const onSubmit = (data: NotificationFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Notification settings:", data);
      console.log("Selected DND days:", selectedDays);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
      setIsLoading(false);
    }, 1000);
  };

  // Handle day selection for Do Not Disturb
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Handle adding a new recipient
  const handleAddRecipient = () => {
    toast({
      title: "Add Recipient",
      description: "This would open a modal to add a new notification recipient.",
    });
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (id: string) => {
    toast({
      title: "Recipient removed",
      description: "The notification recipient has been removed.",
    });
  };

  // Handle editing recipient notifications
  const handleEditRecipient = (id: string) => {
    toast({
      title: "Edit Recipient",
      description: "This would open a modal to edit notification types for this recipient.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Notification Channels */}
          <SettingSection
            title="Notification Channels"
            description="Select which channels to receive notifications on"
          >
            <div className="space-y-4 max-w-xl">
              <FormField
                control={form.control}
                name="inApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>In-App Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications within the application
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Receive email notifications for important events
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>SMS Notifications</FormLabel>
                      <FormDescription>
                        Receive text messages for critical alerts
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slack"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Slack Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications in your Slack workspace
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>

          {/* Do Not Disturb */}
          <SettingSection
            title="Do Not Disturb"
            description="Set times when you don't want to receive notifications"
          >
            <div className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="doNotDisturbStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doNotDisturbEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Do Not Disturb Days</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDays.includes(day) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
                <FormDescription>
                  Select days when you don't want to receive notifications
                </FormDescription>
              </div>
            </div>
          </SettingSection>

          {/* Notification Types */}
          <SettingSection
            title="Notification Types"
            description="Choose which events trigger notifications"
            isLoading={isLoading}
          >
            <div className="space-y-4 max-w-xl">
              <FormField
                control={form.control}
                name="newSurveyResponses"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>New Survey Responses</FormLabel>
                      <FormDescription>
                        Notify when new survey responses are submitted
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lowResponseRate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Low Response Rate Alerts</FormLabel>
                      <FormDescription>
                        Notify when a survey has low participation
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="significantEscoreChange"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Significant eNPS/Score Changes</FormLabel>
                      <FormDescription>
                        Notify of significant changes in engagement scores
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledReportCompletion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Scheduled Report Completions</FormLabel>
                      <FormDescription>
                        Notify when scheduled reports are ready
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>

          {/* Notification Recipients */}
          <SettingSection
            title="Notification Recipients"
            description="Manage who receives specific types of notifications"
            footer={
              <Button 
                type="button"
                onClick={handleAddRecipient}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Recipient</span>
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Notification Types</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">{recipient.name}</TableCell>
                    <TableCell>{recipient.email}</TableCell>
                    <TableCell>{recipient.role}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {recipient.notificationTypes.map((type) => (
                          <span 
                            key={type} 
                            className="bg-muted text-xs px-2 py-0.5 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRecipient(recipient.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveRecipient(recipient.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SettingSection>
        </div>
      </form>
    </Form>
  );
}
