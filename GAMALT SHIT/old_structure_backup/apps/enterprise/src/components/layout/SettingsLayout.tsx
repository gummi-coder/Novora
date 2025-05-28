
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, 
  Building2, 
  Palette, 
  Bell, 
  ClipboardList, 
  Link, 
  ShieldCheck 
} from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Define settings tabs
  const tabs = [
    { 
      id: "account", 
      label: "Account & Profile", 
      path: "/settings/account",
      icon: <User className="h-4 w-4 mr-2" /> 
    },
    { 
      id: "company", 
      label: "Company", 
      path: "/settings/company",
      icon: <Building2 className="h-4 w-4 mr-2" /> 
    },
    { 
      id: "branding", 
      label: "Branding", 
      path: "/settings/branding",
      icon: <Palette className="h-4 w-4 mr-2" /> 
    },
    { 
      id: "notifications", 
      label: "Notifications", 
      path: "/settings/notifications",
      icon: <Bell className="h-4 w-4 mr-2" /> 
    },
    { 
      id: "surveys", 
      label: "Survey Defaults", 
      path: "/settings/surveys",
      icon: <ClipboardList className="h-4 w-4 mr-2" /> 
    },
    { 
      id: "integrations", 
      label: "Integrations", 
      path: "/settings/integrations",
      icon: <Link className="h-4 w-4 mr-2" /> 
    },
    { 
      id: "security", 
      label: "Security", 
      path: "/settings/security",
      icon: <ShieldCheck className="h-4 w-4 mr-2" /> 
    },
  ];

  // Determine the current active tab based on the URL
  const getCurrentTab = () => {
    const path = currentPath.split('/').pop() || '';
    return tabs.find(tab => tab.id === path)?.id || "account";
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    const tab = tabs.find(t => t.id === value);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, company, and application preferences
          </p>
        </div>
        
        <Tabs 
          value={getCurrentTab()} 
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="flex flex-wrap h-auto p-1 sm:w-full md:w-auto">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="pt-4">
              {children}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default SettingsLayout;
