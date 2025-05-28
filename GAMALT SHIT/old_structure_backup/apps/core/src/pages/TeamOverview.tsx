
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TeamTable } from '@/components/team-overview/TeamTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

const TeamOverview = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Team Overview</h2>
          <Button>+ Add New Team</Button>
        </div>
        
        {/* Search and Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams or managers..."
              className="pl-8"
            />
          </div>
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              <SelectItem value="john-doe">John Doe</SelectItem>
              <SelectItem value="jane-smith">Jane Smith</SelectItem>
              <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Min engagement score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
              <SelectItem value="7">7+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Teams Table */}
        <TeamTable />
      </div>
    </DashboardLayout>
  );
};

export default TeamOverview;
