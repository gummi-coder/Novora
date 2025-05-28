
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, ChevronRight, Users, Briefcase, TrendingUp } from 'lucide-react';
import { TeamDetailsModal } from './TeamDetailsModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for teams
const teamsData = [
  {
    id: 1,
    name: 'Engineering',
    headcount: 24,
    manager: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://github.com/shadcn.png',
      initials: 'JD',
    },
    avgEngagement: 8.2,
    trend: 'up',
  },
  {
    id: 2,
    name: 'Sales',
    headcount: 18,
    manager: {
      id: 2,
      name: 'Jane Smith',
      avatar: null,
      initials: 'JS',
    },
    avgEngagement: 6.7,
    trend: 'down',
  },
  {
    id: 3,
    name: 'Marketing',
    headcount: 12,
    manager: {
      id: 3,
      name: 'Mike Johnson',
      avatar: null,
      initials: 'MJ',
    },
    avgEngagement: 7.5,
    trend: 'neutral',
  },
  {
    id: 4,
    name: 'Customer Support',
    headcount: 15,
    manager: {
      id: 4,
      name: 'Sarah Brown',
      avatar: null,
      initials: 'SB',
    },
    avgEngagement: 7.9,
    trend: 'up',
  },
  {
    id: 5,
    name: 'Design',
    headcount: 8,
    manager: {
      id: 5,
      name: 'Alex Turner',
      avatar: null,
      initials: 'AT',
    },
    avgEngagement: 8.4,
    trend: 'up',
  },
  {
    id: 6,
    name: 'Finance',
    headcount: 6,
    manager: {
      id: 6,
      name: 'Lisa Martin',
      avatar: null,
      initials: 'LM',
    },
    avgEngagement: 7.2,
    trend: 'neutral',
  },
];

export const TeamTable = () => {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const handleViewDetails = (teamId: number) => {
    setSelectedTeam(teamId);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
  };

  // Function to get the engagement score color
  const getEngagementScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 7) return 'text-blue-600 bg-blue-50';
    if (score >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Function to get the trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↑</span>;
      case 'down':
        return <span className="text-red-500">↓</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Headcount</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Avg Engagement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamsData.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {team.headcount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={team.manager.avatar || ""} />
                          <AvatarFallback>{team.manager.initials}</AvatarFallback>
                        </Avatar>
                        {team.manager.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementScoreColor(team.avgEngagement)}`}>
                          {team.avgEngagement}
                        </span>
                        {getTrendIcon(team.trend)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">Export CSV</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(team.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {teamsData.map((team) => (
          <Card key={team.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{team.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementScoreColor(team.avgEngagement)}`}>
                  {team.avgEngagement} {getTrendIcon(team.trend)}
                </span>
              </div>
              
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{team.headcount} members</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={team.manager.avatar || ""} />
                      <AvatarFallback>{team.manager.initials}</AvatarFallback>
                    </Avatar>
                    <span>{team.manager.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-2"
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(team.id)}
                  className="h-8"
                >
                  Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Details Modal */}
      {selectedTeam !== null && (
        <TeamDetailsModal 
          teamId={selectedTeam}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
