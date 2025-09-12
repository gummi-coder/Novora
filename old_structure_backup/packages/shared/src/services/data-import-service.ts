import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { validateSchema } from '../utils/validation';

export const ImportFormatSchema = z.enum(['csv', 'json']);
export type ImportFormat = z.infer<typeof ImportFormatSchema>;

export const ImportOptionsSchema = z.object({
  format: ImportFormatSchema,
  validateOnly: z.boolean().default(false),
  conflictResolution: z.enum(['skip', 'overwrite', 'merge']).default('skip'),
  dryRun: z.boolean().default(false),
});

export type ImportOptions = z.infer<typeof ImportOptionsSchema>;

export class DataImportService {
  private static instance: DataImportService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): DataImportService {
    if (!DataImportService.instance) {
      DataImportService.instance = new DataImportService();
    }
    return DataImportService.instance;
  }

  async importData(
    dataType: string,
    data: Buffer,
    options: ImportOptions
  ): Promise<ImportResult> {
    try {
      const parsedData = await this.parseData(data, options.format);
      const validationResult = await this.validateData(dataType, parsedData);

      if (!validationResult.success) {
        return {
          success: false,
          errors: validationResult.errors,
          stats: {
            total: parsedData.length,
            valid: 0,
            invalid: parsedData.length,
            imported: 0,
          },
        };
      }

      if (options.validateOnly || options.dryRun) {
        return {
          success: true,
          stats: {
            total: parsedData.length,
            valid: parsedData.length,
            invalid: 0,
            imported: 0,
          },
        };
      }

      const importResult = await this.importValidatedData(
        dataType,
        parsedData,
        options
      );

      return {
        success: true,
        stats: importResult.stats,
      };
    } catch (error) {
      logger.error('Import failed:', error);
      throw error;
    }
  }

  private async parseData(
    data: Buffer,
    format: ImportFormat
  ): Promise<Record<string, any>[]> {
    switch (format) {
      case 'csv':
        return parse(data, {
          columns: true,
          skip_empty_lines: true,
        });
      case 'json':
        return JSON.parse(data.toString());
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private async validateData(
    dataType: string,
    data: Record<string, any>[]
  ): Promise<ValidationResult> {
    const schema = this.getValidationSchema(dataType);
    const errors: ValidationError[] = [];

    for (const [index, item] of data.entries()) {
      const result = validateSchema(schema, item);
      if (!result.success) {
        errors.push({
          index,
          errors: result.errors,
        });
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  private async importValidatedData(
    dataType: string,
    data: Record<string, any>[],
    options: ImportOptions
  ): Promise<ImportResult> {
    const stats = {
      total: data.length,
      valid: data.length,
      invalid: 0,
      imported: 0,
    };

    switch (dataType) {
      case 'users':
        await this.importUsers(data, options, stats);
        break;
      case 'surveys':
        await this.importSurveys(data, options, stats);
        break;
      case 'responses':
        await this.importResponses(data, options, stats);
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    return { success: true, stats };
  }

  private async importUsers(
    data: Record<string, any>[],
    options: ImportOptions,
    stats: ImportStats
  ): Promise<void> {
    for (const user of data) {
      try {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          switch (options.conflictResolution) {
            case 'skip':
              continue;
            case 'overwrite':
              await this.prisma.user.update({
                where: { id: existingUser.id },
                data: user,
              });
              break;
            case 'merge':
              await this.prisma.user.update({
                where: { id: existingUser.id },
                data: { ...existingUser, ...user },
              });
              break;
          }
        } else {
          await this.prisma.user.create({ data: user });
        }
        stats.imported++;
      } catch (error) {
        logger.error('Failed to import user:', error);
      }
    }
  }

  private async importSurveys(
    data: Record<string, any>[],
    options: ImportOptions,
    stats: ImportStats
  ): Promise<void> {
    for (const survey of data) {
      try {
        const existingSurvey = await this.prisma.survey.findUnique({
          where: { id: survey.id },
        });

        if (existingSurvey) {
          switch (options.conflictResolution) {
            case 'skip':
              continue;
            case 'overwrite':
              await this.prisma.survey.update({
                where: { id: existingSurvey.id },
                data: survey,
              });
              break;
            case 'merge':
              await this.prisma.survey.update({
                where: { id: existingSurvey.id },
                data: { ...existingSurvey, ...survey },
              });
              break;
          }
        } else {
          await this.prisma.survey.create({ data: survey });
        }
        stats.imported++;
      } catch (error) {
        logger.error('Failed to import survey:', error);
      }
    }
  }

  private async importResponses(
    data: Record<string, any>[],
    options: ImportOptions,
    stats: ImportStats
  ): Promise<void> {
    for (const response of data) {
      try {
        const existingResponse = await this.prisma.surveyResponse.findUnique({
          where: { id: response.id },
        });

        if (existingResponse) {
          switch (options.conflictResolution) {
            case 'skip':
              continue;
            case 'overwrite':
              await this.prisma.surveyResponse.update({
                where: { id: existingResponse.id },
                data: response,
              });
              break;
            case 'merge':
              await this.prisma.surveyResponse.update({
                where: { id: existingResponse.id },
                data: { ...existingResponse, ...response },
              });
              break;
          }
        } else {
          await this.prisma.surveyResponse.create({ data: response });
        }
        stats.imported++;
      } catch (error) {
        logger.error('Failed to import response:', error);
      }
    }
  }

  private getValidationSchema(dataType: string): z.ZodType<any> {
    // Implement schema validation based on data type
    switch (dataType) {
      case 'users':
        return z.object({
          email: z.string().email(),
          name: z.string(),
          role: z.string(),
        });
      case 'surveys':
        return z.object({
          title: z.string(),
          description: z.string(),
          questions: z.array(z.any()),
        });
      case 'responses':
        return z.object({
          surveyId: z.string(),
          userId: z.string(),
          answers: z.array(z.any()),
        });
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }
  }
}

interface ImportResult {
  success: boolean;
  errors?: ValidationError[];
  stats: ImportStats;
}

interface ImportStats {
  total: number;
  valid: number;
  invalid: number;
  imported: number;
}

interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  index: number;
  errors: string[];
} 