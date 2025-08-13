import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import BookMeeting from "./pages/BookMeeting";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import CreateSurvey from "./pages/CreateSurvey";
import QuestionBank from "./pages/QuestionBank";
import SurveysList from "./pages/SurveysList";
import SurveyResponse from "./pages/SurveyResponse";
import SurveyPreview from "./pages/SurveyPreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/book" element={<BookMeeting />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/overview" element={<Dashboard />} />
          <Route path="/dashboard/trends" element={<Dashboard />} />
          <Route path="/dashboard/feedback" element={<Dashboard />} />
          <Route path="/dashboard/reports" element={<Dashboard />} />
          <Route path="/dashboard/settings" element={<Dashboard />} />
          
          {/* Owner-specific routes */}
          <Route path="/dashboard/culture-trends" element={<Dashboard />} />
          <Route path="/dashboard/departments" element={<Dashboard />} />
          <Route path="/dashboard/adoption-usage" element={<Dashboard />} />
          <Route path="/dashboard/admin-activity" element={<Dashboard />} />
          
          {/* Admin-specific routes */}
          <Route path="/dashboard/team-trends" element={<Dashboard />} />
          <Route path="/dashboard/alerts" element={<Dashboard />} />
          <Route path="/dashboard/employees" element={<Dashboard />} />
          <Route path="/dashboard/surveys" element={<Dashboard />} />
          <Route path="/dashboard/my-teams" element={<Dashboard />} />
          
          {/* Auto-Pilot routes */}
          <Route path="/dashboard/auto-pilot" element={<Dashboard />} />
          
          {/* Survey Routes */}
          <Route path="/surveys" element={<SurveysList />} />
          <Route path="/surveys/create" element={<CreateSurvey />} />
          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/survey/:surveyId" element={<SurveyResponse />} />
          <Route path="/survey/preview" element={<SurveyPreview />} />
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
