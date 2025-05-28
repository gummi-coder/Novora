import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TeamOverview from "./pages/TeamOverview";
import SurveysList from "./pages/SurveysList";
import SurveyBuilder from "./pages/SurveyBuilder";
import SurveyResults from "./pages/SurveyResults";
import SurveyTest from "./pages/SurveyTest";
import ReportsList from "./pages/ReportsList";
import ReportBuilder from "./pages/ReportBuilder";
import ReportDetail from "./pages/ReportDetail";
import AnalyticsPage from "./pages/Analytics";
import MetricDetail from "./pages/MetricDetail";
import CustomDashboard from "./pages/CustomDashboard";
import AlertsList from "./pages/AlertsList";
import AlertDetail from "./pages/AlertDetail";
import AlertSettings from "./pages/AlertSettings";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

// Settings Pages
import AccountSettings from "./pages/settings/AccountSettings";
import CompanySettings from "./pages/settings/CompanySettings";
import BrandingSettings from "./pages/settings/BrandingSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import SurveySettings from "./pages/settings/SurveySettings";
import IntegrationSettings from "./pages/settings/IntegrationSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";

// Profile Pages
import ProfilePage from "./pages/ProfilePage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teams" element={<TeamOverview />} />
          <Route path="/surveys" element={<SurveysList />} />
          <Route path="/surveys/new" element={<SurveyBuilder />} />
          <Route path="/surveys/:id" element={<SurveyResults />} />
          <Route path="/surveys/:id/edit" element={<SurveyBuilder />} />
          <Route path="/surveys/test" element={<SurveyTest />} />
          <Route path="/reports" element={<ReportsList />} />
          <Route path="/reports/new" element={<ReportBuilder />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/reports/:id/edit" element={<ReportBuilder />} />
          {/* Analytics Routes */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/:metricId" element={<MetricDetail />} />
          <Route path="/analytics/custom" element={<CustomDashboard />} />
          {/* Alerts Routes */}
          <Route path="/alerts" element={<AlertsList />} />
          <Route path="/alerts/:alertId" element={<AlertDetail />} />
          <Route path="/alerts/settings" element={<AlertSettings />} />
          {/* Calendar Route */}
          <Route path="/calendar" element={<Calendar />} />
          
          {/* Settings Routes */}
          <Route path="/settings/account" element={<AccountSettings />} />
          <Route path="/settings/company" element={<CompanySettings />} />
          <Route path="/settings/branding" element={<BrandingSettings />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/surveys" element={<SurveySettings />} />
          <Route path="/settings/integrations" element={<IntegrationSettings />} />
          <Route path="/settings/security" element={<SecuritySettings />} />
          
          {/* Profile Routes */}
          <Route path="/profile/me" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<TeamMemberProfilePage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
