import { Unleash } from 'unleash-client';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { z } from 'zod';

export const FeatureFlagSchema = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  strategies: z.array(z.object({
    name: z.string(),
    parameters: z.record(z.unknown()),
  })),
  variants: z.array(z.object({
    name: z.string(),
    weight: z.number(),
    payload: z.record(z.unknown()).optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private unleash: Unleash;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
    this.unleash = new Unleash({
      url: process.env.UNLEASH_URL || 'http://localhost:4242/api',
      appName: process.env.APP_NAME || 'employee-survey',
      instanceId: process.env.INSTANCE_ID || 'development',
      refreshInterval: 15000,
      metricsInterval: 60000,
    });
  }

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  async isEnabled(
    flagName: string,
    context: {
      userId?: string;
      email?: string;
      subscriptionTier?: 'core' | 'pro' | 'enterprise';
      customProperties?: Record<string, string>;
    }
  ): Promise<boolean> {
    try {
      const isEnabled = this.unleash.isEnabled(flagName, {
        userId: context.userId,
        email: context.email,
        properties: {
          subscriptionTier: context.subscriptionTier,
          ...context.customProperties,
        },
      });

      // Track flag usage
      await this.trackFlagUsage(flagName, context, isEnabled);

      return isEnabled;
    } catch (error) {
      logger.error('Error checking feature flag:', error);
      return false;
    }
  }

  async getVariant(
    flagName: string,
    context: {
      userId?: string;
      email?: string;
      subscriptionTier?: 'core' | 'pro' | 'enterprise';
      customProperties?: Record<string, string>;
    }
  ): Promise<{ name: string; payload?: Record<string, unknown> }> {
    try {
      const variant = this.unleash.getVariant(flagName, {
        userId: context.userId,
        email: context.email,
        properties: {
          subscriptionTier: context.subscriptionTier,
          ...context.customProperties,
        },
      });

      // Track variant usage
      await this.trackVariantUsage(flagName, variant.name, context);

      return {
        name: variant.name,
        payload: variant.payload,
      };
    } catch (error) {
      logger.error('Error getting feature flag variant:', error);
      return { name: 'disabled' };
    }
  }

  private async trackFlagUsage(
    flagName: string,
    context: {
      userId?: string;
      email?: string;
      subscriptionTier?: 'core' | 'pro' | 'enterprise';
    },
    isEnabled: boolean
  ): Promise<void> {
    try {
      await this.prisma.featureFlagUsage.create({
        data: {
          flagName,
          userId: context.userId,
          email: context.email,
          subscriptionTier: context.subscriptionTier,
          isEnabled,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error tracking feature flag usage:', error);
    }
  }

  private async trackVariantUsage(
    flagName: string,
    variantName: string,
    context: {
      userId?: string;
      email?: string;
      subscriptionTier?: 'core' | 'pro' | 'enterprise';
    }
  ): Promise<void> {
    try {
      await this.prisma.featureFlagVariantUsage.create({
        data: {
          flagName,
          variantName,
          userId: context.userId,
          email: context.email,
          subscriptionTier: context.subscriptionTier,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error tracking feature flag variant usage:', error);
    }
  }

  async getFlagUsageStats(flagName: string): Promise<{
    totalUsage: number;
    enabledCount: number;
    disabledCount: number;
    variantDistribution: Record<string, number>;
  }> {
    const [totalUsage, enabledCount, disabledCount, variantDistribution] = await Promise.all([
      this.prisma.featureFlagUsage.count({ where: { flagName } }),
      this.prisma.featureFlagUsage.count({ where: { flagName, isEnabled: true } }),
      this.prisma.featureFlagUsage.count({ where: { flagName, isEnabled: false } }),
      this.getVariantDistribution(flagName),
    ]);

    return {
      totalUsage,
      enabledCount,
      disabledCount,
      variantDistribution,
    };
  }

  private async getVariantDistribution(flagName: string): Promise<Record<string, number>> {
    const variants = await this.prisma.featureFlagVariantUsage.groupBy({
      by: ['variantName'],
      where: { flagName },
      _count: true,
    });

    return variants.reduce((acc, { variantName, _count }) => {
      acc[variantName] = _count;
      return acc;
    }, {} as Record<string, number>);
  }
} 