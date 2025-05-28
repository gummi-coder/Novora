
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SettingSection } from "./SettingSection";
import { AvatarUploader } from "./AvatarUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define form schemas
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Mock sessions data
const activeSessions = [
  {
    device: "Chrome on Windows",
    ip: "192.168.1.1",
    location: "New York, USA",
    lastActive: "2023-05-10T14:30:00",
    current: true,
  },
  {
    device: "Safari on iPhone",
    ip: "198.51.100.42",
    location: "Los Angeles, USA",
    lastActive: "2023-05-09T10:15:00",
    current: false,
  },
  {
    device: "Firefox on Mac",
    ip: "203.0.113.17",
    location: "Chicago, USA",
    lastActive: "2023-05-07T08:22:00",
    current: false,
  },
];

export function AccountForm() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = React.useState(false);

  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      title: "HR Manager",
      department: "Human Resources",
    },
  });

  // Password form setup
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Profile data:", data);
      console.log("Profile image:", profileImage);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Password data:", data);
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      setIsLoading(false);
      passwordForm.reset();
    }, 1000);
  };

  // Handle session revocation
  const handleRevokeSession = (index: number) => {
    toast({
      title: "Session revoked",
      description: `Session on ${activeSessions[index].device} has been revoked.`,
    });
  };

  // Handle 2FA toggle
  const handleTwoFactorToggle = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    if (checked) {
      setShowTwoFactorSetup(true);
    } else {
      toast({
        title: "Two-factor authentication disabled",
        description: "Your account is now less secure.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <SettingSection
            title="Profile Information"
            description="Update your account profile information and avatar"
            isLoading={isLoading}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex justify-center">
                <AvatarUploader 
                  currentImageUrl="/placeholder.svg" 
                  onImageChange={setProfileImage}
                  name={profileForm.watch("fullName")}
                />
              </div>
              <div className="md:w-2/3 space-y-4">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Human Resources" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </SettingSection>
        </form>
      </Form>

      {/* Password Change */}
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <SettingSection
            title="Change Password"
            description="Update your password to maintain account security"
            isLoading={isLoading}
          >
            <div className="space-y-4 max-w-md">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>
        </form>
      </Form>

      {/* Two-Factor Authentication */}
      <SettingSection
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        footer={
          showTwoFactorSetup ? (
            <Button onClick={() => setShowTwoFactorSetup(false)}>
              Complete Setup
            </Button>
          ) : null
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-muted-foreground">
                Protect your account with an additional security layer
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={handleTwoFactorToggle} 
            />
          </div>

          {showTwoFactorSetup && (
            <div className="mt-6 border rounded-md p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Setup Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Download an authenticator app like Google Authenticator or Authy</li>
                <li>Scan the QR code below with the app</li>
                <li>Enter the verification code from the app</li>
              </ol>
              <div className="flex justify-center my-4">
                <div className="bg-white p-4 rounded-md">
                  {/* Placeholder for QR Code */}
                  <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                    QR Code Placeholder
                  </div>
                </div>
              </div>
              <div className="max-w-xs mx-auto">
                <Input 
                  type="text" 
                  placeholder="Enter verification code" 
                  className="mb-2"
                />
                <Button className="w-full">Verify and Enable</Button>
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      {/* Session Management */}
      <SettingSection
        title="Active Sessions"
        description="View and manage your active sessions across devices"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeSessions.map((session, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{session.device}</div>
                  {session.current && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm">
                      Current
                    </span>
                  )}
                </TableCell>
                <TableCell>{session.ip}</TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>
                  {new Date(session.lastActive).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={session.current}
                    onClick={() => handleRevokeSession(index)}
                  >
                    {session.current ? "Active" : "Revoke"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SettingSection>
    </div>
  );
}
