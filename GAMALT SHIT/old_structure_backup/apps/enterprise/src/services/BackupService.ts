import { BackupConfig, BackupJob, BackupStats, BackupValidation } from '@/types/backup';

export class BackupService {
  private static instance: BackupService;
  private configs: Map<string, BackupConfig>;
  private jobs: Map<string, BackupJob>;

  private constructor() {
    this.configs = new Map();
    this.jobs = new Map();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  public async createBackupConfig(config: Omit<BackupConfig, 'id' | 'status' | 'lastBackup' | 'nextBackup'>): Promise<BackupConfig> {
    try {
      const newConfig: BackupConfig = {
        ...config,
        id: crypto.randomUUID(),
        status: 'active',
        lastBackup: undefined,
        nextBackup: this.calculateNextBackup(config.schedule),
      };

      this.configs.set(newConfig.id, newConfig);
      return newConfig;
    } catch (error) {
      console.error('Failed to create backup config:', error);
      throw error;
    }
  }

  public async updateBackupConfig(id: string, updates: Partial<BackupConfig>): Promise<BackupConfig> {
    try {
      const config = this.configs.get(id);
      if (!config) {
        throw new Error(`Backup config ${id} not found`);
      }

      const updatedConfig = { ...config, ...updates };
      this.configs.set(id, updatedConfig);
      return updatedConfig;
    } catch (error) {
      console.error('Failed to update backup config:', error);
      throw error;
    }
  }

  public async deleteBackupConfig(id: string): Promise<void> {
    try {
      this.configs.delete(id);
    } catch (error) {
      console.error('Failed to delete backup config:', error);
      throw error;
    }
  }

  public async getBackupConfigs(): Promise<BackupConfig[]> {
    return Array.from(this.configs.values());
  }

  public async startBackup(configId: string): Promise<BackupJob> {
    try {
      const config = this.configs.get(configId);
      if (!config) {
        throw new Error(`Backup config ${configId} not found`);
      }

      const job: BackupJob = {
        id: crypto.randomUUID(),
        configId,
        status: 'running',
        startTime: new Date(),
        files: 0,
        progress: 0,
      };

      this.jobs.set(job.id, job);

      // Simulate backup process
      await this.simulateBackup(job);

      return job;
    } catch (error) {
      console.error('Failed to start backup:', error);
      throw error;
    }
  }

  public async getBackupJobs(): Promise<BackupJob[]> {
    return Array.from(this.jobs.values());
  }

  public async getBackupStats(): Promise<BackupStats> {
    const jobs = await this.getBackupJobs();
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const totalSize = completedJobs.reduce((sum, job) => sum + (job.size || 0), 0);
    const successRate = completedJobs.length / jobs.length;

    return {
      totalBackups: completedJobs.length,
      totalSize,
      lastBackup: completedJobs[0]?.endTime || new Date(),
      successRate,
      averageDuration: this.calculateAverageDuration(completedJobs),
      storageUsage: {
        used: totalSize,
        available: 1000000000, // 1GB
        total: 1000000000,
      },
      recentJobs: jobs.slice(0, 5),
    };
  }

  public async validateBackupConfig(config: BackupConfig): Promise<BackupValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate required fields
    if (!config.name) {
      errors.push('Backup name is required');
    }

    if (!config.storage.path) {
      errors.push('Storage path is required');
    }

    // Validate schedule
    if (config.schedule.frequency === 'weekly' && (!config.schedule.days || config.schedule.days.length === 0)) {
      errors.push('Days must be specified for weekly backups');
    }

    // Validate storage credentials
    if (config.storage.type !== 'local' && !config.storage.credentials) {
      errors.push('Storage credentials are required for cloud storage');
    }

    // Add recommendations
    if (!config.encryption) {
      recommendations.push('Consider enabling encryption for sensitive data');
    }

    if (!config.compression) {
      recommendations.push('Consider enabling compression to reduce storage usage');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
    };
  }

  private calculateNextBackup(schedule: BackupConfig['schedule']): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const nextBackup = new Date(now);
    nextBackup.setHours(hours, minutes, 0, 0);

    if (nextBackup <= now) {
      switch (schedule.frequency) {
        case 'daily':
          nextBackup.setDate(nextBackup.getDate() + 1);
          break;
        case 'weekly':
          const currentDay = nextBackup.getDay();
          const nextDay = schedule.days?.find(day => day > currentDay) || schedule.days?.[0];
          const daysToAdd = nextDay ? nextDay - currentDay : 7 - currentDay + (schedule.days?.[0] || 0);
          nextBackup.setDate(nextBackup.getDate() + daysToAdd);
          break;
        case 'monthly':
          nextBackup.setMonth(nextBackup.getMonth() + 1);
          break;
      }
    }

    return nextBackup;
  }

  private calculateAverageDuration(jobs: BackupJob[]): number {
    if (jobs.length === 0) return 0;
    return jobs.reduce((sum, job) => {
      if (!job.endTime) return sum;
      return sum + (job.endTime.getTime() - job.startTime.getTime());
    }, 0) / jobs.length;
  }

  private async simulateBackup(job: BackupJob): Promise<void> {
    // Simulate backup process
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedJob = this.jobs.get(job.id);
      if (updatedJob) {
        updatedJob.progress = progress;
        updatedJob.files = Math.floor(Math.random() * 1000);
        this.jobs.set(job.id, updatedJob);
      }
    }

    // Complete the backup
    const completedJob = this.jobs.get(job.id);
    if (completedJob) {
      completedJob.status = 'completed';
      completedJob.endTime = new Date();
      completedJob.size = Math.floor(Math.random() * 1000000);
      this.jobs.set(job.id, completedJob);
    }
  }
} 