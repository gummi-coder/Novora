import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  subdomain: z.string(),
  plan: z.enum(['core', 'pro', 'enterprise']),
  status: z.enum(['active', 'suspended', 'trial']),
  settings: z.object({
    features: z.record(z.boolean()),
    limits: z.object({
      users: z.number(),
      surveys: z.number(),
      apiCalls: z.number(),
      storage: z.number(),
    }),
    branding: z.object({
      logo: z.string().optional(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
      }),
      theme: z.string(),
    }),
    regional: z.object({
      timezone: z.string(),
      locale: z.string(),
      currency: z.string(),
    }),
  }),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export class TenantService {
  private static instance: TenantService;
  private prisma: PrismaClient;
  private redis: Redis;

  private constructor() {
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL);
  }

  static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  async createTenant(data: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    try {
      const tenant = await this.prisma.tenant.create({
        data: {
          ...data,
          settings: data.settings as any, // Prisma will handle JSON serialization
        },
      });

      // Cache tenant data
      await this.cacheTenant(tenant);

      return tenant;
    } catch (error) {
      logger.error('Error creating tenant:', error);
      throw error;
    }
  }

  async getTenant(id: string): Promise<Tenant | null> {
    try {
      // Try to get from cache first
      const cached = await this.redis.get(`tenant:${id}`);
      if (cached) {
        return JSON.parse(cached) as Tenant;
      }

      // If not in cache, get from database
      const tenant = await this.prisma.tenant.findUnique({
        where: { id },
      });

      if (tenant) {
        // Cache for future requests
        await this.cacheTenant(tenant);
      }

      return tenant;
    } catch (error) {
      logger.error('Error getting tenant:', error);
      throw error;
    }
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { subdomain },
      });

      if (tenant) {
        await this.cacheTenant(tenant);
      }

      return tenant;
    } catch (error) {
      logger.error('Error getting tenant by subdomain:', error);
      throw error;
    }
  }

  async updateTenant(
    id: string,
    data: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Tenant> {
    try {
      const tenant = await this.prisma.tenant.update({
        where: { id },
        data: {
          ...data,
          settings: data.settings as any,
        },
      });

      // Update cache
      await this.cacheTenant(tenant);

      return tenant;
    } catch (error) {
      logger.error('Error updating tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      await this.prisma.tenant.delete({
        where: { id },
      });

      // Remove from cache
      await this.redis.del(`tenant:${id}`);
    } catch (error) {
      logger.error('Error deleting tenant:', error);
      throw error;
    }
  }

  async checkResourceLimits(tenantId: string, resource: keyof Tenant['settings']['limits']): Promise<boolean> {
    try {
      const tenant = await this.getTenant(tenantId);
      if (!tenant) return false;

      const currentUsage = await this.getResourceUsage(tenantId, resource);
      const limit = tenant.settings.limits[resource];

      return currentUsage < limit;
    } catch (error) {
      logger.error('Error checking resource limits:', error);
      throw error;
    }
  }

  private async getResourceUsage(
    tenantId: string,
    resource: keyof Tenant['settings']['limits']
  ): Promise<number> {
    // Implement resource usage tracking based on the resource type
    switch (resource) {
      case 'users':
        return this.prisma.user.count({ where: { tenantId } });
      case 'surveys':
        return this.prisma.survey.count({ where: { tenantId } });
      case 'apiCalls':
        return this.prisma.apiCall.count({ where: { tenantId } });
      case 'storage':
        return this.prisma.file.aggregate({
          where: { tenantId },
          _sum: { size: true },
        }).then(result => result._sum.size || 0);
      default:
        return 0;
    }
  }

  private async cacheTenant(tenant: Tenant): Promise<void> {
    await this.redis.set(
      `tenant:${tenant.id}`,
      JSON.stringify(tenant),
      'EX',
      3600 // Cache for 1 hour
    );
  }

  async getTenantFeatures(tenantId: string): Promise<Record<string, boolean>> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.settings.features || {};
  }

  async getTenantBranding(tenantId: string): Promise<Tenant['settings']['branding']> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.settings.branding || {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#cccccc',
      },
      theme: 'light',
    };
  }

  async getTenantRegionalSettings(tenantId: string): Promise<Tenant['settings']['regional']> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.settings.regional || {
      timezone: 'UTC',
      locale: 'en',
      currency: 'USD',
    };
  }
} 