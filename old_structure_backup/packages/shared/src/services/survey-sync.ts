import { PrismaClient } from '@prisma/client';
import { SurveyInstance, SurveyAnalytics } from '../types/survey';
import { logger } from '../utils/logger';
import { redis } from '../utils/redis';
import { queue } from '../utils/queue';

const prisma = new PrismaClient();

export class SurveySyncService {
  private static instance: SurveySyncService;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): SurveySyncService {
    if (!SurveySyncService.instance) {
      SurveySyncService.instance = new SurveySyncService();
    }
    return SurveySyncService.instance;
  }

  async startSync(interval: number = 5 * 60 * 1000): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncSurveyData();
      } catch (error) {
        logger.error('Survey sync failed:', error);
      }
    }, interval);
  }

  async stopSync(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncSurveyData(): Promise<void> {
    const activeSurveys = await prisma.surveyInstance.findMany({
      where: { status: 'active' },
      include: { responses: true },
    });

    for (const survey of activeSurveys) {
      await this.processSurveySync(survey);
    }
  }

  private async processSurveySync(survey: SurveyInstance): Promise<void> {
    try {
      // Update analytics
      const analytics = await this.calculateAnalytics(survey);
      await this.updateAnalytics(survey.id, analytics);

      // Cache results
      await this.cacheSurveyData(survey.id, analytics);

      // Queue notifications
      await this.queueNotifications(survey, analytics);

      logger.info(`Survey ${survey.id} sync completed successfully`);
    } catch (error) {
      logger.error(`Survey ${survey.id} sync failed:`, error);
      throw error;
    }
  }

  private async calculateAnalytics(survey: SurveyInstance): Promise<SurveyAnalytics> {
    // Calculate response rate
    const responseRate = survey.responses.length / survey.assignedTo.length;

    // Calculate question analytics
    const questionAnalytics = await Promise.all(
      survey.responses.flatMap(response =>
        response.answers.map(async answer => {
          const question = await prisma.surveyQuestion.findUnique({
            where: { id: answer.questionId },
          });

          return {
            questionId: answer.questionId,
            responseCount: survey.responses.length,
            averageRating: this.calculateAverageRating(answer.value),
            distribution: this.calculateDistribution(answer.value),
            sentiment: await this.analyzeSentiment(answer.value),
          };
        })
      )
    );

    // Calculate trends
    const trends = await this.calculateTrends(survey);

    return {
      surveyId: survey.id,
      responseRate,
      averageCompletionTime: this.calculateAverageCompletionTime(survey),
      questionAnalytics,
      trends,
    };
  }

  private async updateAnalytics(surveyId: string, analytics: SurveyAnalytics): Promise<void> {
    await prisma.surveyAnalytics.upsert({
      where: { surveyId },
      update: analytics,
      create: { ...analytics, surveyId },
    });
  }

  private async cacheSurveyData(surveyId: string, analytics: SurveyAnalytics): Promise<void> {
    const cacheKey = `survey:${surveyId}:analytics`;
    await redis.set(cacheKey, JSON.stringify(analytics), 'EX', 3600); // Cache for 1 hour
  }

  private async queueNotifications(survey: SurveyInstance, analytics: SurveyAnalytics): Promise<void> {
    if (analytics.responseRate >= 0.8) { // 80% response rate threshold
      await queue.add('survey-completion-notification', {
        surveyId: survey.id,
        responseRate: analytics.responseRate,
      });
    }
  }

  private calculateAverageRating(value: unknown): number | undefined {
    if (typeof value === 'number') {
      return value;
    }
    return undefined;
  }

  private calculateDistribution(value: unknown): Record<string, number> | undefined {
    if (typeof value === 'string') {
      return { [value]: 1 };
    }
    return undefined;
  }

  private async analyzeSentiment(value: unknown): Promise<{ positive: number; neutral: number; negative: number } | undefined> {
    if (typeof value === 'string') {
      // Implement sentiment analysis logic here
      return {
        positive: 0.5,
        neutral: 0.3,
        negative: 0.2,
      };
    }
    return undefined;
  }

  private calculateAverageCompletionTime(survey: SurveyInstance): number {
    const completionTimes = survey.responses.map(response => {
      const lastAnswer = response.answers[response.answers.length - 1];
      return lastAnswer.submittedAt.getTime() - survey.startDate.getTime();
    });

    return completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
  }

  private async calculateTrends(survey: SurveyInstance): Promise<Array<{ timestamp: Date; metrics: Record<string, number> }>> {
    // Implement trend calculation logic here
    return [];
  }
} 