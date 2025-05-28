import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import { logger } from '../utils/logger';
import { config } from '../config';
import { z } from 'zod';

export const ExportFormatSchema = z.enum(['csv', 'json', 'pdf']);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportOptionsSchema = z.object({
  format: ExportFormatSchema,
  includeMetadata: z.boolean().default(true),
  compression: z.boolean().default(false),
  filters: z.record(z.unknown()).optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
});

export type ExportOptions = z.infer<typeof ExportOptionsSchema>;

export class DataExportService {
  private static instance: DataExportService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  async exportData(
    dataType: string,
    options: ExportOptions
  ): Promise<{ data: Buffer; filename: string; mimeType: string }> {
    try {
      const data = await this.fetchData(dataType, options);
      const exportResult = await this.formatData(data, options);

      return {
        data: exportResult.data,
        filename: this.generateFilename(dataType, options),
        mimeType: this.getMimeType(options.format),
      };
    } catch (error) {
      logger.error('Export failed:', error);
      throw error;
    }
  }

  private async fetchData(dataType: string, options: ExportOptions): Promise<any> {
    switch (dataType) {
      case 'users':
        return this.fetchUsers(options);
      case 'surveys':
        return this.fetchSurveys(options);
      case 'responses':
        return this.fetchResponses(options);
      case 'analytics':
        return this.fetchAnalytics(options);
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
  }

  private async fetchUsers(options: ExportOptions) {
    const where = this.buildWhereClause(options);
    return this.prisma.user.findMany({
      where,
      include: {
        profile: true,
        preferences: true,
      },
    });
  }

  private async fetchSurveys(options: ExportOptions) {
    const where = this.buildWhereClause(options);
    return this.prisma.survey.findMany({
      where,
      include: {
        questions: true,
        responses: true,
      },
    });
  }

  private async fetchResponses(options: ExportOptions) {
    const where = this.buildWhereClause(options);
    return this.prisma.surveyResponse.findMany({
      where,
      include: {
        answers: true,
        user: true,
      },
    });
  }

  private async fetchAnalytics(options: ExportOptions) {
    const where = this.buildWhereClause(options);
    return this.prisma.analytics.findMany({
      where,
      include: {
        metrics: true,
        dimensions: true,
      },
    });
  }

  private async formatData(
    data: any[],
    options: ExportOptions
  ): Promise<{ data: Buffer }> {
    switch (options.format) {
      case 'csv':
        return this.formatCSV(data);
      case 'json':
        return this.formatJSON(data, options);
      case 'pdf':
        return this.formatPDF(data);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private async formatCSV(data: any[]): Promise<{ data: Buffer }> {
    const parser = new Parser();
    const csv = parser.parse(data);
    return { data: Buffer.from(csv) };
  }

  private async formatJSON(
    data: any[],
    options: ExportOptions
  ): Promise<{ data: Buffer }> {
    const jsonData = {
      metadata: options.includeMetadata ? this.generateMetadata() : undefined,
      data,
    };
    return { data: Buffer.from(JSON.stringify(jsonData, null, 2)) };
  }

  private async formatPDF(data: any[]): Promise<{ data: Buffer }> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument();

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve({ data: Buffer.concat(chunks) }));
      doc.on('error', reject);

      // Add content to PDF
      doc.fontSize(16).text('Data Export Report', { align: 'center' });
      doc.moveDown();
      
      data.forEach((item) => {
        doc.fontSize(12).text(JSON.stringify(item, null, 2));
        doc.moveDown();
      });

      doc.end();
    });
  }

  private buildWhereClause(options: ExportOptions) {
    const where: any = {};

    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.start,
        lte: options.dateRange.end,
      };
    }

    if (options.filters) {
      Object.assign(where, options.filters);
    }

    return where;
  }

  private generateMetadata() {
    return {
      exportDate: new Date(),
      version: config.version,
      environment: config.environment,
    };
  }

  private generateFilename(dataType: string, options: ExportOptions): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const format = options.format;
    return `${dataType}-export-${timestamp}.${format}`;
  }

  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }
} 