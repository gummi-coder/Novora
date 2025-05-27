import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle } from 'lucide-react';
import { EngagementTimeChart } from './EngagementTimeChart';
import { TeamMetricsChart } from './TeamMetricsChart';
import { MemberScoresList } from './MemberScoresList';
import { FileDown } from 'lucide-react';

// Mock team data (this would come from an API)
const teamsData = {
  1: {
    id: 1,
    name: 'Engineering',
    headcount: 24,
    manager: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://github.com/shadcn.png',
      initials: 'JD',
      role: 'Engineering Director',
    },
    avgEngagement: 8.2,
    alert: null,
  },
  2: {
    id: 2,
    name: 'Sales',
    headcount: 18,
    manager: {
      id: 2,
      name: 'Jane Smith',
      avatar: null,
      initials: 'JS',
      role: 'VP of Sales',
    },
    avgEngagement: 6.7,
    alert: {
      message: 'Engagement score dropped by 15% in the last month',
      type: 'warning',
    },
  },
  3: {
    id: 3,
    name: 'Marketing',
    headcount: 12,
    manager: {
      id: 3,
      name: 'Mike Johnson',
      avatar: null,
      initials: 'MJ',
      role: 'Marketing Lead',
    },
    avgEngagement: 7.5,
    alert: null,
  },
  4: {
    id: 4,
    name: 'Customer Support',
    headcount: 15,
    manager: {
      id: 4,
      name: 'Sarah Brown',
      avatar: null,
      initials: 'SB',
      role: 'Support Manager',
    },
    avgEngagement: 7.9,
    alert: null,
  },
  5: {
    id: 5,
    name: 'Design',
    headcount: 8,
    manager: {
      id: 5,
      name: 'Alex Turner',
      avatar: null,
      initials: 'AT',
      role: 'Design Lead',
    },
    avgEngagement: 8.4,
    alert: null,
  },
  6: {
    id: 6,
    name: 'Finance',
    headcount: 6,
    manager: {
      id: 6,
      name: 'Lisa Martin', 
      avatar: null,
      initials: 'LM',
      role: 'Finance Director',
    },
    avgEngagement: 7.2,
    alert: {
      message: 'Response rate below 50% for the latest survey',
      type: 'warning',
    },
  },
};

interface TeamDetailsProps {
  teamId: number;
}

export const TeamDetails = ({ teamId }: TeamDetailsProps) => {
  const [timeRange, setTimeRange] = useState<string>('3m');
  
  // Type assertion to access team data
  const team = teamsData[teamId as keyof typeof teamsData];
  
  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src={team.manager.avatar || ""} />
            <AvatarFallback className="text-lg">{team.manager.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{team.name}</h2>
            <p className="text-muted-foreground">
              {team.headcount} members • Led by {team.manager.name}, {team.manager.role}
            </p>
          </div>
        </div>
        <Button className="w-full md:w-auto">
          <FileDown className="mr-2 h-4 w-4" />
          Export Team Data
        </Button>
      </div>

      {/* Alert Banner (if any) */}
      {team.alert && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{team.alert.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Metrics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Engagement Over Time</CardTitle>
          <CardDescription>View how the team's engagement has changed over time</CardDescription>
          
          <div className="flex justify-end mt-2">
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="3m">3 Months</TabsTrigger>
                <TabsTrigger value="6m">6 Months</TabsTrigger>
                <TabsTrigger value="12m">12 Months</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <EngagementTimeChart timeRange={timeRange} teamId={teamId} />
          </div>
        </CardContent>
      </Card>
      
      {/* Team Metrics Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics Breakdown</CardTitle>
          <CardDescription>Compare different engagement metrics for this team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <TeamMetricsChart teamId={teamId} />
          </div>
        </CardContent>
      </Card>
      
      {/* Member Scores */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Members with the highest engagement scores</CardDescription>
          </CardHeader>
          <CardContent>
            <MemberScoresList teamId={teamId} type="top" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Members with the lowest engagement scores</CardDescription>
          </CardHeader>
          <CardContent>
            <MemberScoresList teamId={teamId} type="bottom" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
