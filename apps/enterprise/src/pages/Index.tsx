import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ENPSCard } from '@/components/dashboard/ENPSCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { EngagementLineChart } from '@/components/charts/EngagementLineChart';
import { SurveyParticipationChart } from '@/components/charts/SurveyParticipationChart';
import { TeamPerformanceTable } from '@/components/dashboard/TeamPerformanceTable';
import { AlertsCard } from '@/components/dashboard/AlertsCard';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Employee Insights</h2>
        
        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ENPSCard />
          <MetricCard metricId="job-satisfaction" />
          <MetricCard metricId="engagement-score" />
          <MetricCard metricId="happiness-index" />
          <MetricCard metricId="manager-relationship" />
          <MetricCard metricId="recognition" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementLineChart />
          <SurveyParticipationChart />
        </div>

        {/* Team Performance & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TeamPerformanceTable />
          </div>
          <div>
            <AlertsCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
