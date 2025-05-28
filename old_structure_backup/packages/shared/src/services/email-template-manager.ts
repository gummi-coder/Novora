import { PrismaClient } from '@prisma/client';
import { EmailTemplate, EmailTemplateCategory } from '../types/email';
import { logger } from '../utils/logger';
import Handlebars from 'handlebars';

export class EmailTemplateManager {
  private static instance: EmailTemplateManager;
  private prisma: PrismaClient;
  private templateCache: Map<string, HandlebarsTemplateDelegate>;

  private constructor() {
    this.prisma = new PrismaClient();
    this.templateCache = new Map();
  }

  static getInstance(): EmailTemplateManager {
    if (!EmailTemplateManager.instance) {
      EmailTemplateManager.instance = new EmailTemplateManager();
    }
    return EmailTemplateManager.instance;
  }

  async getTemplate(id: string): Promise<EmailTemplate> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    return template as EmailTemplate;
  }

  async getTemplatesByCategory(category: EmailTemplateCategory): Promise<EmailTemplate[]> {
    return this.prisma.emailTemplate.findMany({
      where: { category },
    }) as Promise<EmailTemplate[]>;
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const created = await this.prisma.emailTemplate.create({
      data: template,
    });

    return created as EmailTemplate;
  }

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const updated = await this.prisma.emailTemplate.update({
      where: { id },
      data: template,
    });

    // Clear template cache
    this.templateCache.delete(id);

    return updated as EmailTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.prisma.emailTemplate.delete({
      where: { id },
    });

    // Clear template cache
    this.templateCache.delete(id);
  }

  async renderTemplate(template: EmailTemplate, variables: Record<string, unknown>): Promise<{
    subject: string;
    html: string;
    text: string;
  }> {
    try {
      // Get or compile template
      let compiledTemplate = this.templateCache.get(template.id);
      if (!compiledTemplate) {
        compiledTemplate = Handlebars.compile(template.html);
        this.templateCache.set(template.id, compiledTemplate);
      }

      // Render template
      const html = compiledTemplate(variables);
      const text = this.htmlToText(html);
      const subject = this.renderSubject(template.subject, variables);

      return { subject, html, text };
    } catch (error) {
      logger.error('Failed to render template:', error);
      throw error;
    }
  }

  private renderSubject(subject: string, variables: Record<string, unknown>): string {
    return Handlebars.compile(subject)(variables);
  }

  private htmlToText(html: string): string {
    // Implement HTML to text conversion
    // You can use a library like html-to-text
    return html.replace(/<[^>]*>/g, '');
  }

  // Register custom Handlebars helpers
  private registerHelpers(): void {
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString();
    });

    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    });
  }
} 