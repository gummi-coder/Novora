
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertSettingsForm } from "@/components/alerts/AlertSettingsForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AlertSettings() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate("/alerts");
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Alerts
          </Button>
          <h1 className="text-2xl font-bold">Alert Settings</h1>
        </div>
        
        <AlertSettingsForm />
      </div>
    </DashboardLayout>
  );
}
