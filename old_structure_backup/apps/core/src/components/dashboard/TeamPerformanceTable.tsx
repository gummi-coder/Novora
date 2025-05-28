
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

// Mock data for teams
const teams = [
  { 
    id: 1, 
    name: 'Engineering Team', 
    manager: 'Alex Johnson',
    responseRate: 92,
    engagementScore: 8.2,
    change: 0.7,
    status: 'top'
  },
  { 
    id: 2, 
    name: 'Marketing', 
    manager: 'Morgan Lee',
    responseRate: 88,
    engagementScore: 7.9,
    change: 0.3,
    status: 'top'
  },
  { 
    id: 3, 
    name: 'Sales', 
    manager: 'Jamie Smith',
    responseRate: 95,
    engagementScore: 7.8,
    change: 0.5,
    status: 'top'
  },
  { 
    id: 4, 
    name: 'Customer Support', 
    manager: 'Sam Williams',
    responseRate: 75,
    engagementScore: 6.5,
    change: -0.2,
    status: 'low'
  },
  { 
    id: 5, 
    name: 'Finance', 
    manager: 'Taylor Brown',
    responseRate: 82,
    engagementScore: 7.0,
    change: 0.0,
    status: 'average'
  }
];

export function TeamPerformanceTable() {
  // Function to render change indicator
  const renderChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-teal-600">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          <span>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDownRight className="h-3 w-3 mr-1" />
          <span>{change}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-muted-foreground">
          <Minus className="h-3 w-3 mr-1" />
          <span>0</span>
        </div>
      );
    }
  };

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    if (status === 'top') {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Top</Badge>;
    } else if (status === 'low') {
      return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Low</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Average</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Response Rate</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.manager}</TableCell>
                <TableCell className="text-right">{team.responseRate}%</TableCell>
                <TableCell className="text-right">{team.engagementScore}</TableCell>
                <TableCell className="text-right">
                  {renderChangeIndicator(team.change)}
                </TableCell>
                <TableCell>{renderStatusBadge(team.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
