
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, CalendarClock, TrendingUp } from 'lucide-react';

// Flattened array of all members for easy lookup
const allMembers = [
  // Team 1 members
  { id: 101, name: 'Emily Johnson', role: 'Senior Engineer', avatar: null, initials: 'EJ', score: 9.6, lastSurvey: '2023-03-01', team: 'Engineering' },
  { id: 102, name: 'Robert Chen', role: 'Staff Engineer', avatar: null, initials: 'RC', score: 9.4, lastSurvey: '2023-03-02', team: 'Engineering' },
  { id: 103, name: 'Samantha Lee', role: 'Engineering Manager', avatar: null, initials: 'SL', score: 9.2, lastSurvey: '2023-03-01', team: 'Engineering' },
  { id: 104, name: 'David Wilson', role: 'Junior Developer', avatar: null, initials: 'DW', score: 6.7, lastSurvey: '2023-03-01', team: 'Engineering' },
  { id: 105, name: 'Olivia Martinez', role: 'Junior Developer', avatar: null, initials: 'OM', score: 7.1, lastSurvey: '2023-03-03', team: 'Engineering' },
  { id: 106, name: 'Thomas Brown', role: 'DevOps Engineer', avatar: null, initials: 'TB', score: 7.3, lastSurvey: '2023-03-02', team: 'Engineering' },
  
  // Team 2 members
  { id: 201, name: 'Jessica Adams', role: 'Sales Director', avatar: null, initials: 'JA', score: 8.9, lastSurvey: '2023-03-01', team: 'Sales' },
  { id: 202, name: 'Michael Torres', role: 'Account Executive', avatar: null, initials: 'MT', score: 8.5, lastSurvey: '2023-03-01', team: 'Sales' },
  { id: 203, name: 'Amanda Wong', role: 'Sales Manager', avatar: null, initials: 'AW', score: 8.2, lastSurvey: '2023-03-02', team: 'Sales' },
  { id: 204, name: 'Kevin Patel', role: 'Sales Representative', avatar: null, initials: 'KP', score: 4.3, lastSurvey: '2023-03-01', team: 'Sales' },
  { id: 205, name: 'Laura Smith', role: 'Sales Representative', avatar: null, initials: 'LS', score: 4.9, lastSurvey: '2023-03-03', team: 'Sales' },
  { id: 206, name: 'Daniel Lewis', role: 'Account Manager', avatar: null, initials: 'DL', score: 5.4, lastSurvey: '2023-03-02', team: 'Sales' },
  
  // Additional members for other teams
  { id: 301, name: 'Sophie Turner', role: 'Marketing Lead', avatar: null, initials: 'ST', score: 8.7, lastSurvey: '2023-03-05', team: 'Marketing' },
  { id: 401, name: 'James Wright', role: 'Support Lead', avatar: null, initials: 'JW', score: 8.3, lastSurvey: '2023-03-03', team: 'Customer Support' },
  { id: 501, name: 'Ella Davis', role: 'UI Designer', avatar: null, initials: 'ED', score: 8.9, lastSurvey: '2023-03-04', team: 'Design' },
  { id: 601, name: 'William Clark', role: 'Financial Analyst', avatar: null, initials: 'WC', score: 7.8, lastSurvey: '2023-03-01', team: 'Finance' },
];

interface MemberDetailsModalProps {
  memberId: number;
  onClose: () => void;
}

// Mock metrics data for a member
const memberMetrics = {
  'Engagement': 8.2,
  'Job Satisfaction': 7.9,
  'Manager Relationship': 6.5,
  'Peer Relationships': 8.7,
  'Work-Life Balance': 6.8,
  'Career Growth': 7.3,
  'Recognition': 6.2,
};

export const MemberDetailsModal = ({ memberId, onClose }: MemberDetailsModalProps) => {
  const [open, setOpen] = useState(true);
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose();
    }
  };

  // Find the member in our flattened array
  const member = allMembers.find(m => m.id === memberId);
  
  if (!member) {
    return null;
  }

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600 bg-green-50';
    if (score >= 8) return 'text-blue-600 bg-blue-50';
    if (score >= 7) return 'text-teal-600 bg-teal-50';
    if (score >= 6) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Member Info */}
          <div className="flex flex-col items-center text-center p-4">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={member.avatar || ""} />
              <AvatarFallback className="text-lg">{member.initials}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{member.name}</h3>
            <div className="text-sm text-muted-foreground">{member.role} • {member.team}</div>
            <div className="flex items-center mt-2 text-sm">
              <CalendarClock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>Last survey: {new Date(member.lastSurvey).toLocaleDateString()}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-sm font-medium">Overall Score:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(member.score)}`}>
                {member.score.toFixed(1)}
              </span>
            </div>
          </div>
          
          {/* Metrics Breakdown */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-2">Engagement Metrics</h4>
            {Object.entries(memberMetrics).map(([metric, score]) => (
              <div key={metric} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                <span className="text-sm">{metric}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                  {score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button className="flex-1" variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Feedback
            </Button>
            <Button className="flex-1">
              <TrendingUp className="mr-2 h-4 w-4" />
              Growth Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
