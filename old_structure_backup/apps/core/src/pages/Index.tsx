
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ENPSCard } from '@/components/dashboard/ENPSCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { EngagementLineChart } from '@/components/charts/EngagementLineChart';
import { SurveyParticipationChart } from '@/components/charts/SurveyParticipationChart';
import { TeamPerformanceTable } from '@/components/dashboard/TeamPerformanceTable';
import { AlertsCard } from '@/components/dashboard/AlertsCard';
import { 
  Users, 
  Heart, 
  TrendingUp, 
  Smile, 
  MessageSquare, 
  Award
} from 'lucide-react';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Employee Insights</h2>
        
        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ENPSCard />
          <MetricCard 
            title="Job Satisfaction"
            value="7.4"
            change={0.4}
            icon={Heart}
            info="Average score out of 10"
          />
          <MetricCard 
            title="Engagement Score"
            value="7.9"
            change={0.5}
            icon={TrendingUp}
            info="Average score out of 10"
          />
          <MetricCard 
            title="Happiness Index"
            value="8.1"
            change={0.7}
            icon={Smile}
            info="Average score out of 10"
          />
          <MetricCard 
            title="Manager Relationship"
            value="7.6"
            change={0.2}
            icon={Users}
            info="Average score out of 10"
          />
          <MetricCard 
            title="Recognition"
            value="6.9"
            change={-0.3}
            icon={Award}
            info="Average score out of 10"
          />
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
