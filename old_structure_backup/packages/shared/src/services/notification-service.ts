import { PrismaClient } from '@prisma/client';
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { EmailService } from './email-service';
import { z } from 'zod';

export const NotificationChannelSchema = z.enum(['in_app', 'email', 'push']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationTypeSchema = z.enum([
  'survey_created',
  'survey_completed',
  'survey_reminder',
  'account_update',
  'system_alert',
  'feature_announcement',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  data: z.record(z.unknown()).optional(),
  channels: z.array(NotificationChannelSchema),
  priority: NotificationPrioritySchema,
  read: z.boolean().default(false),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export class NotificationService {
  private static instance: NotificationService;
  private prisma: PrismaClient;
  private redis: Redis;
  private queue: Queue;
  private emailService: EmailService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL);
    this.queue = new Queue('notifications', {
      connection: this.redis,
    });
    this.emailService = EmailService.getInstance();

    this.setupWorker();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupWorker() {
    const worker = new Worker(
      'notifications',
      async (job) => {
        const notification = job.data as Notification;
        await this.processNotification(notification);
      },
      { connection: this.redis }
    );

    worker.on('completed', (job) => {
      logger.info(`Processed notification ${job.id}`);
    });

    worker.on('failed', (job, error) => {
      logger.error(`Failed to process notification ${job?.id}:`, error);
    });
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options: {
      channels?: NotificationChannel[];
      priority?: NotificationPriority;
      data?: Record<string, unknown>;
      expiresAt?: Date;
    } = {}
  ): Promise<Notification> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Filter channels based on user preferences
      const channels = options.channels?.filter(channel => 
        preferences.channels[channel]?.enabled
      ) || ['in_app'];

      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          data: options.data,
          channels,
          priority: options.priority || 'medium',
          expiresAt: options.expiresAt,
        },
      });

      // Queue notification for processing
      await this.queue.add('process', notification, {
        priority: this.getPriorityValue(options.priority),
      });

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  private async processNotification(notification: Notification): Promise<void> {
    try {
      await Promise.all(
        notification.channels.map(channel => 
          this.sendToChannel(notification, channel)
        )
      );

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { processed: true },
      });
    } catch (error) {
      logger.error('Error processing notification:', error);
      throw error;
    }
  }

  private async sendToChannel(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel) {
      case 'in_app':
        await this.sendInAppNotification(notification);
        break;
      case 'email':
        await this.sendEmailNotification(notification);
        break;
      case 'push':
        await this.sendPushNotification(notification);
        break;
    }
  }

  private async sendInAppNotification(notification: Notification): Promise<void> {
    // Store in Redis for real-time delivery
    await this.redis.publish(
      `notifications:${notification.userId}`,
      JSON.stringify(notification)
    );
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    const template = await this.getEmailTemplate(notification.type);
    await this.emailService.queueEmail(template, {
      to: notification.userId,
      subject: notification.title,
      variables: {
        message: notification.message,
        ...notification.data,
      },
    });
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    const pushSubscription = await this.getPushSubscription(notification.userId);
    if (pushSubscription) {
      // Implement push notification sending logic
      // This could use Web Push API or a service like Firebase Cloud Messaging
    }
  }

  private async getUserPreferences(userId: string) {
    const preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    return preferences || {
      channels: {
        in_app: { enabled: true },
        email: { enabled: true },
        push: { enabled: false },
      },
      types: {
        survey_created: { enabled: true },
        survey_completed: { enabled: true },
        survey_reminder: { enabled: true },
        account_update: { enabled: true },
        system_alert: { enabled: true },
        feature_announcement: { enabled: true },
      },
    };
  }

  private getPriorityValue(priority?: NotificationPriority): number {
    switch (priority) {
      case 'urgent':
        return 1;
      case 'high':
        return 2;
      case 'medium':
        return 3;
      case 'low':
        return 4;
      default:
        return 3;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
  }

  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      includeRead?: boolean;
    } = {}
  ): Promise<Notification[]> {
    const { page = 1, limit = 20, includeRead = false } = options;

    return this.prisma.notification.findMany({
      where: {
        userId,
        read: includeRead ? undefined : false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
} 