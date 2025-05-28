import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import Users from "@/pages/Users";
import Billing from "@/pages/Billing";
import SystemAlerts from "@/pages/SystemAlerts";
import Feedback from "@/pages/Feedback";
import Engagement from "@/pages/Engagement";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="users" element={<Users />} />
          <Route path="billing" element={<Billing />} />
          <Route path="system-alerts" element={<SystemAlerts />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="engagement" element={<Engagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;
