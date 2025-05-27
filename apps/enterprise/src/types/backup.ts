export interface BackupConfig {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    days?: number[];
    retention: number;
  };
  storage: {
    type: 'local' | 's3' | 'azure' | 'gcp';
    path: string;
    credentials?: {
      accessKey?: string;
      secretKey?: string;
      region?: string;
    };
  };
  compression: boolean;
  encryption: boolean;
  encryptionKey?: string;
  status: 'active' | 'paused' | 'failed';
  lastBackup?: Date;
  nextBackup?: Date;
}

export interface BackupJob {
  id: string;
  configId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  size?: number;
  error?: string;
  files: number;
  progress: number;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackup: Date;
  successRate: number;
  averageDuration: number;
  storageUsage: {
    used: number;
    available: number;
    total: number;
  };
  recentJobs: BackupJob[];
}

export interface BackupValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
} 