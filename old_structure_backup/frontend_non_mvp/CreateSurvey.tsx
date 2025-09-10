import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MultiStepSurveyBuilder from "@/components/survey/MultiStepSurveyBuilder";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user has permission to create surveys (admin only)
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can create surveys.",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  // Show loading or redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const handleComplete = (data: any) => {
    console.log("Survey completed:", data);
      toast({
      title: "Survey Created Successfully!",
      description: "Your survey has been launched and is now active.",
    });
    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <MultiStepSurveyBuilder
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
};

export default CreateSurvey;
