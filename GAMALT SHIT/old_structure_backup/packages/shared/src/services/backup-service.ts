import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { S3 } from 'aws-sdk';
import { logger } from '../utils/logger';
import { config } from '../config';
import { z } from 'zod';

const execAsync = promisify(exec);

export const BackupOptionsSchema = z.object({
  includeData: z.boolean().default(true),
  includeSchema: z.boolean().default(true),
  compression: z.boolean().default(true),
  encryption: z.boolean().default(true),
  retention: z.number().default(30), // days
});

export type BackupOptions = z.infer<typeof BackupOptionsSchema>;

export class BackupService {
  private static instance: BackupService;
  private prisma: PrismaClient;
  private s3: S3;

  private constructor() {
    this.prisma = new PrismaClient();
    this.s3 = new S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
    });
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup(options: BackupOptions): Promise<BackupResult> {
    try {
      const timestamp = new Date().toISOString();
      const backupPath = `/tmp/backup-${timestamp}`;
      const backupFile = `${backupPath}.sql`;

      // Create backup directory
      await execAsync(`mkdir -p ${backupPath}`);

      // Export schema if requested
      if (options.includeSchema) {
        await this.exportSchema(backupPath);
      }

      // Export data if requested
      if (options.includeData) {
        await this.exportData(backupPath);
      }

      // Compress if requested
      if (options.compression) {
        await this.compressBackup(backupPath);
      }

      // Encrypt if requested
      if (options.encryption) {
        await this.encryptBackup(backupPath);
      }

      // Upload to S3
      const s3Key = `backups/${timestamp}.tar.gz`;
      await this.uploadToS3(backupPath, s3Key);

      // Clean up local files
      await execAsync(`rm -rf ${backupPath}`);

      // Update backup metadata
      await this.recordBackup({
        timestamp: new Date(timestamp),
        path: s3Key,
        options,
      });

      return {
        success: true,
        backupId: timestamp,
        path: s3Key,
      };
    } catch (error) {
      logger.error('Backup failed:', error);
      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<RestoreResult> {
    try {
      const backup = await this.getBackupMetadata(backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      const tempPath = `/tmp/restore-${backupId}`;
      await execAsync(`mkdir -p ${tempPath}`);

      // Download from S3
      await this.downloadFromS3(backup.path, tempPath);

      // Decrypt if needed
      if (backup.options.encryption) {
        await this.decryptBackup(tempPath);
      }

      // Decompress if needed
      if (backup.options.compression) {
        await this.decompressBackup(tempPath);
      }

      // Restore schema if included
      if (backup.options.includeSchema) {
        await this.restoreSchema(tempPath);
      }

      // Restore data if included
      if (backup.options.includeData) {
        await this.restoreData(tempPath);
      }

      // Clean up
      await execAsync(`rm -rf ${tempPath}`);

      return {
        success: true,
        message: 'Backup restored successfully',
      };
    } catch (error) {
      logger.error('Restore failed:', error);
      throw error;
    }
  }

  private async exportSchema(path: string): Promise<void> {
    const { stdout } = await execAsync(
      `pg_dump -h ${config.database.host} -U ${config.database.user} -s ${config.database.name} > ${path}/schema.sql`
    );
    logger.info('Schema exported:', stdout);
  }

  private async exportData(path: string): Promise<void> {
    const { stdout } = await execAsync(
      `pg_dump -h ${config.database.host} -U ${config.database.user} -a ${config.database.name} > ${path}/data.sql`
    );
    logger.info('Data exported:', stdout);
  }

  private async compressBackup(path: string): Promise<void> {
    await execAsync(`tar -czf ${path}.tar.gz -C ${path} .`);
  }

  private async encryptBackup(path: string): Promise<void> {
    await execAsync(
      `gpg --encrypt --recipient ${config.backup.gpgKey} ${path}.tar.gz`
    );
  }

  private async uploadToS3(path: string, key: string): Promise<void> {
    await this.s3
      .upload({
        Bucket: config.aws.backupBucket,
        Key: key,
        Body: require('fs').createReadStream(`${path}.tar.gz`),
      })
      .promise();
  }

  private async downloadFromS3(key: string, path: string): Promise<void> {
    const { Body } = await this.s3
      .getObject({
        Bucket: config.aws.backupBucket,
        Key: key,
      })
      .promise();

    require('fs').writeFileSync(`${path}/backup.tar.gz`, Body);
  }

  private async decryptBackup(path: string): Promise<void> {
    await execAsync(`gpg --decrypt ${path}/backup.tar.gz > ${path}/decrypted.tar.gz`);
  }

  private async decompressBackup(path: string): Promise<void> {
    await execAsync(`tar -xzf ${path}/decrypted.tar.gz -C ${path}`);
  }

  private async restoreSchema(path: string): Promise<void> {
    await execAsync(
      `psql -h ${config.database.host} -U ${config.database.user} ${config.database.name} < ${path}/schema.sql`
    );
  }

  private async restoreData(path: string): Promise<void> {
    await execAsync(
      `psql -h ${config.database.host} -U ${config.database.user} ${config.database.name} < ${path}/data.sql`
    );
  }

  private async recordBackup(backup: BackupMetadata): Promise<void> {
    await this.prisma.backup.create({
      data: {
        timestamp: backup.timestamp,
        path: backup.path,
        options: backup.options,
      },
    });
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    const backup = await this.prisma.backup.findUnique({
      where: { id: backupId },
    });
    return backup as BackupMetadata | null;
  }
}

interface BackupResult {
  success: boolean;
  backupId: string;
  path: string;
}

interface RestoreResult {
  success: boolean;
  message: string;
}

interface BackupMetadata {
  timestamp: Date;
  path: string;
  options: BackupOptions;
} 