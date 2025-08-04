export interface Team {
  id: string;
  name: string;
  companyId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  members?: TeamMember[];
  dashboards?: Dashboard[];
  notes?: Note[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  createdBy: string;
  isPublic: boolean;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  widgets?: Widget[];
}

export interface Widget {
  id: string;
  dashboardId: string;
  type: 'CHART' | 'TABLE' | 'METRIC' | 'CUSTOM';
  title: string;
  config: Record<string, any>;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Integration {
  id: string;
  companyId: string;
  type: 'SLACK' | 'JIRA' | 'GITHUB' | 'CUSTOM';
  config: Record<string, any>;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 