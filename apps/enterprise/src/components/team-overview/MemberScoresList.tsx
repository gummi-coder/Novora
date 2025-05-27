
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, UserCog } from 'lucide-react';
import { MemberDetailsModal } from './MemberDetailsModal';

interface MemberScoresListProps {
  teamId: number;
  type: 'top' | 'bottom';
}

// Mock data for member scores
const mockMemberData: Record<string, {
  top: Array<{
    id: number;
    name: string;
    role: string;
    avatar: string | null;
    initials: string;
    score: number;
    lastSurvey: string;
  }>;
  bottom: Array<{
    id: number;
    name: string;
    role: string;
    avatar: string | null;
    initials: string;
    score: number;
    lastSurvey: string;
  }>;
}> = {
  '1': {
    top: [
      { id: 101, name: 'Emily Johnson', role: 'Senior Engineer', avatar: null, initials: 'EJ', score: 9.6, lastSurvey: '2023-03-01' },
      { id: 102, name: 'Robert Chen', role: 'Staff Engineer', avatar: null, initials: 'RC', score: 9.4, lastSurvey: '2023-03-02' },
      { id: 103, name: 'Samantha Lee', role: 'Engineering Manager', avatar: null, initials: 'SL', score: 9.2, lastSurvey: '2023-03-01' }
    ],
    bottom: [
      { id: 104, name: 'David Wilson', role: 'Junior Developer', avatar: null, initials: 'DW', score: 6.7, lastSurvey: '2023-03-01' },
      { id: 105, name: 'Olivia Martinez', role: 'Junior Developer', avatar: null, initials: 'OM', score: 7.1, lastSurvey: '2023-03-03' },
      { id: 106, name: 'Thomas Brown', role: 'DevOps Engineer', avatar: null, initials: 'TB', score: 7.3, lastSurvey: '2023-03-02' }
    ]
  },
  '2': {
    top: [
      { id: 201, name: 'Jessica Adams', role: 'Sales Director', avatar: null, initials: 'JA', score: 8.9, lastSurvey: '2023-03-01' },
      { id: 202, name: 'Michael Torres', role: 'Account Executive', avatar: null, initials: 'MT', score: 8.5, lastSurvey: '2023-03-01' },
      { id: 203, name: 'Amanda Wong', role: 'Sales Manager', avatar: null, initials: 'AW', score: 8.2, lastSurvey: '2023-03-02' }
    ],
    bottom: [
      { id: 204, name: 'Kevin Patel', role: 'Sales Representative', avatar: null, initials: 'KP', score: 4.3, lastSurvey: '2023-03-01' },
      { id: 205, name: 'Laura Smith', role: 'Sales Representative', avatar: null, initials: 'LS', score: 4.9, lastSurvey: '2023-03-03' },
      { id: 206, name: 'Daniel Lewis', role: 'Account Manager', avatar: null, initials: 'DL', score: 5.4, lastSurvey: '2023-03-02' }
    ]
  }
};

// Fill in mock data for teams 3-6
for (let i = 3; i <= 6; i++) {
  mockMemberData[i.toString()] = {
    top: mockMemberData['1'].top.map(member => ({
      ...member,
      id: member.id + (i - 1) * 100, // Adjust IDs
      score: member.score - Math.random() // Add some variation
    })),
    bottom: mockMemberData['1'].bottom.map(member => ({
      ...member,
      id: member.id + (i - 1) * 100, // Adjust IDs
      score: member.score + Math.random() // Add some variation
    }))
  };
}

export const MemberScoresList = ({ teamId, type }: MemberScoresListProps) => {
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  // Convert teamId to string to use as a key
  const teamIdKey = teamId.toString();
  const teamMembers = mockMemberData[teamIdKey] || mockMemberData['1'];
  const members = teamMembers[type];

  const handleViewMember = (memberId: number) => {
    setSelectedMember(memberId);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600 bg-green-50';
    if (score >= 8) return 'text-blue-600 bg-blue-50';
    if (score >= 7) return 'text-teal-600 bg-teal-50';
    if (score >= 6) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => (
          <div 
            key={member.id} 
            className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={member.avatar || ""} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-sm">{member.name}</h4>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(member.score)}`}>
                {member.score.toFixed(1)}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => handleViewMember(member.id)}
              >
                <UserCog className="h-4 w-4" />
                <span className="sr-only">View Details</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Details Modal */}
      {selectedMember !== null && (
        <MemberDetailsModal 
          memberId={selectedMember}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
