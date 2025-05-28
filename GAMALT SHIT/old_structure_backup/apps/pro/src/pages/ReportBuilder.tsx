
import React from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportBuilder as ReportBuilderComponent } from "@/components/reports/ReportBuilder";

const ReportBuilder = () => {
  const { reportId } = useParams();
  
  // This would be loaded from an API in a real application
  const mockEditData = reportId ? {
    // Step 1
    reportType: 'overall',
    surveys: ['1', '2'],
    metrics: ['1', '3'],
    dateRange: { 
      from: new Date(2025, 0, 1), 
      to: new Date(2025, 2, 31) 
    },
    
    // Step 2
    formats: ['pdf', 'csv'],
    departments: ['1', '3'],
    anonymize: true,
    
    // Step 3
    scheduleType: 'recurring',
    recurringType: 'monthly',
    scheduleDate: new Date(2025, 3, 15),
    notifications: ['1', '3'],
    
    // Step 4
    name: 'Q1 Engagement Summary',
  } : undefined;

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            {reportId ? 'Edit Report' : 'Create New Report'}
          </h1>
        </div>
        
        <ReportBuilderComponent 
          editMode={!!reportId}
          reportId={reportId}
          initialData={mockEditData}
        />
      </div>
    </DashboardLayout>
  );
};

export default ReportBuilder;
