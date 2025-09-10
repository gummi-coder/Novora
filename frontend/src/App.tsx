import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MVPLanding from "./pages/MVPLanding";
import MVPDashboard from "./pages/MVPDashboard";
import MVPSignIn from "./pages/auth/MVPSignIn";
import MVPSignUp from "./pages/auth/MVPSignUp";
import MVPSurveyPage from "./pages/MVPSurveyPage";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Simple test component
const TestComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-blue-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Test Page Working!</h1>
      <p className="text-gray-600">If you see this, routing is working correctly</p>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Route - Redirect to MVP */}
        <Route path="/" element={<Navigate to="/mvp" replace />} />
        
        {/* Auth Routes */}
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        
        {/* MVP Routes */}
        <Route path="/mvp" element={
          <LanguageProvider>
            <MVPLanding />
          </LanguageProvider>
        } />
        <Route path="/mvp-dashboard" element={
          <LanguageProvider>
            <MVPDashboard />
          </LanguageProvider>
        } />
        <Route path="/mvp-signin" element={
          <LanguageProvider>
            <MVPSignIn />
          </LanguageProvider>
        } />
        <Route path="/mvp-signup" element={
          <LanguageProvider>
            <MVPSignUp />
          </LanguageProvider>
        } />
        <Route path="/survey/:token" element={
          <LanguageProvider>
            <MVPSurveyPage />
          </LanguageProvider>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Toast notifications for MVP pages */}
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
