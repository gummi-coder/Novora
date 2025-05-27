
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Step1TypeAndScope,
  Step2FormatAndFilters,
  Step3ScheduleAndDelivery,
  Step4ReviewAndGenerate
} from "@/components/reports/ReportSteps";
import { useToast } from "@/hooks/use-toast";

interface ReportBuilderProps {
  editMode?: boolean;
  reportId?: string;
  initialData?: any;
}

export function ReportBuilder({ editMode = false, reportId, initialData }: ReportBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportData, setReportData] = useState(initialData || {
    // Step 1
    reportType: '',
    surveys: [],
    metrics: [],
    dateRange: { from: undefined, to: undefined },
    
    // Step 2
    formats: [],
    departments: [],
    anonymize: false,
    
    // Step 3
    scheduleType: 'one-off',
    recurringType: 'weekly',
    scheduleDate: undefined,
    notifications: [],
    
    // Step 4
    name: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const totalSteps = 4;

  const updateReportData = (data: Partial<typeof reportData>) => {
    setReportData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // In a real app, you would call an API to create/update the report
    toast({
      title: editMode ? "Report updated" : "Report created",
      description: `Report "${reportData.name}" has been ${editMode ? "updated" : "created"} successfully.`,
    });
    
    // Navigate back to reports list
    navigate('/reports');
  };

  const handleGenerateNow = async () => {
    // In a real app, you would call an API to generate the report immediately
    toast({
      title: "Report generation started",
      description: "Your report is being generated and will be available shortly.",
    });
    
    // Navigate back to reports list
    navigate('/reports');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1TypeAndScope
            data={reportData}
            updateData={updateReportData}
          />
        );
      case 2:
        return (
          <Step2FormatAndFilters
            data={reportData}
            updateData={updateReportData}
          />
        );
      case 3:
        return (
          <Step3ScheduleAndDelivery
            data={reportData}
            updateData={updateReportData}
          />
        );
      case 4:
        return (
          <Step4ReviewAndGenerate
            data={reportData}
            updateData={updateReportData}
          />
        );
      default:
        return null;
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return reportData.reportType && 
          ((reportData.surveys && reportData.surveys.length > 0) || 
           (reportData.metrics && reportData.metrics.length > 0)) &&
          reportData.dateRange.from && reportData.dateRange.to;
      case 2:
        return reportData.formats && reportData.formats.length > 0;
      case 3:
        return reportData.scheduleType === 'one-off' || 
          (reportData.scheduleType === 'recurring' && reportData.recurringType);
      case 4:
        return reportData.name && reportData.name.trim() !== '';
      default:
        return false;
    }
  };
  
  const stepTitles = [
    "Report Type & Scope",
    "Format & Filters",
    "Schedule & Delivery",
    "Review & Generate"
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{editMode ? "Edit Report" : "Create New Report"}</CardTitle>
        <CardDescription>
          Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-8">
          {renderStep()}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/reports')}
        >
          Cancel
        </Button>
        
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={handlePrevious}
            >
              Previous
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={handleNext}
              disabled={!validateCurrentStep()}
            >
              Next
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGenerateNow}
                disabled={!validateCurrentStep()}
              >
                Generate Now
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!validateCurrentStep()}
              >
                {editMode ? "Save Changes" : "Save Schedule"}
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
