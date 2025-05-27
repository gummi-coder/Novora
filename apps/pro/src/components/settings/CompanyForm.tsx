
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SettingSection } from "./SettingSection";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Search, UserX } from "lucide-react";

// Define form schema
const companyFormSchema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  website: z.string().url({ message: "Please enter a valid URL" }).or(z.literal("")),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string(),
  defaultLanguage: z.string(),
  anonymitySetting: z.string(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

// Mock company admin data
const companyAdmins = [
  {
    id: '1',
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    role: 'Admin',
    lastActive: '2023-05-10T14:30:00',
  },
  {
    id: '2',
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    role: 'Manager',
    lastActive: '2023-05-09T10:15:00',
  },
  {
    id: '3',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    role: 'Admin',
    lastActive: '2023-05-08T08:45:00',
  }
];

// License information
const licenseInfo = {
  plan: 'Enterprise',
  seats: {
    total: 100,
    used: 76,
  },
  renewalDate: '2024-06-15',
};

export function CompanyForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Company form setup
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "Acme Corporation",
      website: "https://acme.example.com",
      address1: "123 Business Ave",
      address2: "Suite 500",
      city: "San Francisco",
      state: "CA",
      zipCode: "94107",
      country: "United States",
      timezone: "America/Los_Angeles",
      defaultLanguage: "en-US",
      anonymitySetting: "partial",
    },
  });

  // Handle form submission
  const onSubmit = (data: CompanyFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Company data:", data);
      toast({
        title: "Company settings updated",
        description: "Your company settings have been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };

  // Handle user role change
  const handleRoleChange = (userId: string, role: string) => {
    toast({
      title: "Role updated",
      description: `User role has been updated to ${role}.`,
    });
  };

  // Handle remove user
  const handleRemoveUser = (userId: string) => {
    toast({
      title: "User removed",
      description: "User has been removed from company administrators.",
    });
  };

  // Handle invite user
  const handleInviteUser = () => {
    toast({
      title: "Invitation sent",
      description: "An invitation has been sent to the new administrator.",
    });
  };

  // Filter users based on search query
  const filteredAdmins = searchQuery 
    ? companyAdmins.filter(admin => 
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : companyAdmins;

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SettingSection
            title="Company Information"
            description="Manage your company details and address"
            isLoading={isLoading}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Business Ave" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Suite 500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="94107" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </SettingSection>

          <SettingSection
            title="Regional Settings"
            description="Configure timezone, language and default settings"
            isLoading={isLoading}
          >
            <div className="space-y-4 max-w-xl">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anonymitySetting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Survey Anonymity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select anonymity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full">Fully Anonymous</SelectItem>
                        <SelectItem value="partial">Partially Anonymous</SelectItem>
                        <SelectItem value="identified">Identified Responses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This setting determines the default anonymity level for new surveys
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>
        </form>
      </Form>

      {/* License Information */}
      <SettingSection
        title="License Information"
        description="View details about your EngagePulse subscription"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="text-lg font-medium">{licenseInfo.plan}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Seats</p>
              <p className="text-lg font-medium">
                {licenseInfo.seats.used} / {licenseInfo.seats.total} used
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(licenseInfo.seats.used / licenseInfo.seats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Renewal Date</p>
              <p className="text-lg font-medium">
                {new Date(licenseInfo.renewalDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </div>
      </SettingSection>

      {/* Administrators Management */}
      <SettingSection
        title="Company Administrators"
        description="Manage users who have administrator access to company settings"
        footer={
          <div className="flex justify-between w-full">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setSearchQuery('')}
              disabled={!searchQuery}
            >
              Clear Search
            </Button>
            <Button 
              type="button"
              onClick={handleInviteUser}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Invite Admin</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search administrators..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={admin.role}
                      onValueChange={(value) => handleRoleChange(admin.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.lastActive).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(admin.id)}
                    >
                      <UserX className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No administrators found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SettingSection>
    </div>
  );
}
