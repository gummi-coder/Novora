import { MailService } from '@sendgrid/mail';
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { EmailTemplate, EmailData, EmailTracking } from '../types/email';
import { config } from '../config';

export class EmailService {
  private static instance: EmailService;
  private mailService: MailService;
  private emailQueue: Queue;
  private redis: Redis;

  private constructor() {
    this.mailService = new MailService();
    this.mailService.setApiKey(config.email.sendgridApiKey);
    this.redis = new Redis(config.redis.url);
    this.emailQueue = new Queue('email-queue', {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    this.setupQueueWorker();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private setupQueueWorker() {
    const worker = new Worker(
      'email-queue',
      async (job) => {
        const { template, data, tracking } = job.data;
        await this.sendEmail(template, data, tracking);
      },
      { connection: this.redis }
    );

    worker.on('completed', (job) => {
      logger.info(`Email job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Email job ${job?.id} failed:`, err);
    });
  }

  async sendEmail(
    template: EmailTemplate,
    data: EmailData,
    tracking?: EmailTracking
  ): Promise<void> {
    try {
      const emailContent = await this.renderTemplate(template, data);
      
      const msg = {
        to: data.to,
        from: config.email.fromAddress,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
        customArgs: {
          templateId: template.id,
          trackingId: tracking?.id,
        },
      };

      await this.mailService.send(msg);
      await this.recordEmailSent(template.id, data, tracking);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async queueEmail(
    template: EmailTemplate,
    data: EmailData,
    tracking?: EmailTracking
  ): Promise<void> {
    await this.emailQueue.add('send-email', {
      template,
      data,
      tracking,
    });
  }

  private async renderTemplate(
    template: EmailTemplate,
    data: EmailData
  ): Promise<{ subject: string; html: string; text: string }> {
    // Implement template rendering logic here
    // You can use a templating engine like Handlebars or EJS
    return {
      subject: template.subject,
      html: template.html,
      text: template.text,
    };
  }

  private async recordEmailSent(
    templateId: string,
    data: EmailData,
    tracking?: EmailTracking
  ): Promise<void> {
    // Record email sent in database
    // This could be used for analytics and tracking
  }

  async handleBounce(email: string, reason: string): Promise<void> {
    // Handle bounced emails
    // Update user status, notify admins, etc.
  }

  async handleOpen(trackingId: string): Promise<void> {
    // Record email open
  }

  async handleClick(trackingId: string, url: string): Promise<void> {
    // Record email click
  }
} 