export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  teamId?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: Date;
}

export interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Invitation {
  id: string;
  email: string;
  teamId: string;
  role: TeamMember['role'];
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

class UserService {
  async getCurrentUser(): Promise<User> {
    // TODO: Implement API call to get current user
    throw new Error('Not implemented');
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    // TODO: Implement API call to get team members
    throw new Error('Not implemented');
  }

  async createTeam(name: string): Promise<Team> {
    // TODO: Implement API call to create team
    throw new Error('Not implemented');
  }

  async updateTeamMember(teamId: string, userId: string, role: TeamMember['role']): Promise<TeamMember> {
    // TODO: Implement API call to update team member
    throw new Error('Not implemented');
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    // TODO: Implement API call to remove team member
    throw new Error('Not implemented');
  }

  async sendInvitation(email: string, teamId: string, role: TeamMember['role']): Promise<Invitation> {
    // TODO: Implement API call to send invitation
    throw new Error('Not implemented');
  }

  async acceptInvitation(invitationId: string): Promise<TeamMember> {
    // TODO: Implement API call to accept invitation
    throw new Error('Not implemented');
  }

  async declineInvitation(invitationId: string): Promise<void> {
    // TODO: Implement API call to decline invitation
    throw new Error('Not implemented');
  }

  async getPendingInvitations(): Promise<Invitation[]> {
    // TODO: Implement API call to get pending invitations
    throw new Error('Not implemented');
  }
}

export const userService = new UserService(); 