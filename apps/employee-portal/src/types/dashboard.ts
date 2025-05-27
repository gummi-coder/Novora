export type DashboardAccessLevel = 'view' | 'edit' | 'admin';

export type WidgetType = 'chart' | 'table' | 'metric' | 'text';

export interface ChartWidgetConfig {
  chartType: 'line' | 'bar' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }[];
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      title?: {
        display?: boolean;
        text?: string;
      };
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
    };
  };
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: ChartWidgetConfig;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  grid: {
    cols: number;
    rowHeight: number;
  };
}

export interface DashboardShare {
  id: string;
  userId: string;
  accessLevel: DashboardAccessLevel;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardShareLink {
  id: string;
  token: string;
  accessLevel: DashboardAccessLevel;
  expiresAt?: Date;
  maxUses?: number;
  uses: number;
  createdAt: Date;
}

export interface DashboardTemplate {
  id: string;
  title: string;
  description?: string;
  layout: DashboardLayout;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  layout: DashboardLayout;
  ownerId: string;
  shares: DashboardShare[];
  shareLinks: DashboardShareLink[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  templates: DashboardTemplate[];
  loading: boolean;
  error: string | null;
} 