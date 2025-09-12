import { Redis } from 'ioredis';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredTier: 'basic' | 'pro' | 'enterprise';
  percentage?: number; // For gradual rollouts
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, any>;
}

export interface FeatureFlagConfig {
  [key: string]: FeatureFlag;
}

class FeatureFlagService {
  private redis: Redis;
  private defaultFlags: FeatureFlagConfig = {
    'advanced-analytics': {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Access to advanced analytics and reporting features',
      enabled: true,
      requiredTier: 'enterprise',
    },
    'team-management': {
      id: 'team-management',
      name: 'Team Management',
      description: 'Manage team members and roles',
      enabled: true,
      requiredTier: 'pro',
    },
    'api-access': {
      id: 'api-access',
      name: 'API Access',
      description: 'Access to API endpoints',
      enabled: true,
      requiredTier: 'pro',
    },
    'sso': {
      id: 'sso',
      name: 'Single Sign-On',
      description: 'Enterprise SSO integration',
      enabled: true,
      requiredTier: 'enterprise',
    },
    'custom-reports': {
      id: 'custom-reports',
      name: 'Custom Reports',
      description: 'Create and schedule custom reports',
      enabled: true,
      requiredTier: 'pro',
    },
    'data-export': {
      id: 'data-export',
      name: 'Data Export',
      description: 'Export data in various formats',
      enabled: true,
      requiredTier: 'basic',
    },
  };

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.initializeFlags();
  }

  private async initializeFlags(): Promise<void> {
    try {
      const existingFlags = await this.redis.get('feature-flags');
      if (!existingFlags) {
        await this.redis.set('feature-flags', JSON.stringify(this.defaultFlags));
      }
    } catch (error) {
      console.error('Failed to initialize feature flags:', error);
    }
  }

  async getFeatureFlags(): Promise<FeatureFlagConfig> {
    try {
      const flags = await this.redis.get('feature-flags');
      return flags ? JSON.parse(flags) : this.defaultFlags;
    } catch (error) {
      console.error('Failed to get feature flags:', error);
      return this.defaultFlags;
    }
  }

  async getFeatureFlag(id: string): Promise<FeatureFlag | null> {
    try {
      const flags = await this.getFeatureFlags();
      return flags[id] || null;
    } catch (error) {
      console.error(`Failed to get feature flag ${id}:`, error);
      return null;
    }
  }

  async isFeatureEnabled(id: string, userTier: string): Promise<boolean> {
    try {
      const flag = await this.getFeatureFlag(id);
      if (!flag) return false;

      const tierOrder = ['basic', 'pro', 'enterprise'];
      const userTierIndex = tierOrder.indexOf(userTier);
      const requiredTierIndex = tierOrder.indexOf(flag.requiredTier);

      if (userTierIndex < requiredTierIndex) return false;

      if (!flag.enabled) return false;

      if (flag.startDate && new Date() < flag.startDate) return false;
      if (flag.endDate && new Date() > flag.endDate) return false;

      if (flag.percentage !== undefined) {
        const userId = await this.redis.get(`feature:${id}:user`);
        if (!userId) {
          const random = Math.random() * 100;
          await this.redis.set(`feature:${id}:user`, random.toString());
          return random <= flag.percentage;
        }
        return parseFloat(userId) <= flag.percentage;
      }

      return true;
    } catch (error) {
      console.error(`Failed to check feature flag ${id}:`, error);
      return false;
    }
  }

  async updateFeatureFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    try {
      const flags = await this.getFeatureFlags();
      const flag = flags[id];
      if (!flag) return null;

      const updatedFlag = { ...flag, ...updates };
      flags[id] = updatedFlag;

      await this.redis.set('feature-flags', JSON.stringify(flags));
      return updatedFlag;
    } catch (error) {
      console.error(`Failed to update feature flag ${id}:`, error);
      return null;
    }
  }

  async deleteFeatureFlag(id: string): Promise<boolean> {
    try {
      const flags = await this.getFeatureFlags();
      if (!flags[id]) return false;

      delete flags[id];
      await this.redis.set('feature-flags', JSON.stringify(flags));
      return true;
    } catch (error) {
      console.error(`Failed to delete feature flag ${id}:`, error);
      return false;
    }
  }
}

export const featureFlagService = new FeatureFlagService(); 