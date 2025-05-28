import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant-service';
import { logger } from '../utils/logger';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    plan: string;
    status: string;
    settings: {
      features: Record<string, boolean>;
      limits: {
        users: number;
        surveys: number;
        apiCalls: number;
        storage: number;
      };
      branding: {
        logo?: string;
        colors: {
          primary: string;
          secondary: string;
          accent: string;
        };
        theme: string;
      };
      regional: {
        timezone: string;
        locale: string;
        currency: string;
      };
    };
  };
}

export async function tenantMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get tenant from subdomain
    const host = req.get('host');
    const subdomain = host?.split('.')[0];

    if (!subdomain) {
      res.status(400).json({ error: 'No tenant subdomain provided' });
      return;
    }

    // Get tenant from service
    const tenantService = TenantService.getInstance();
    const tenant = await tenantService.getTenantBySubdomain(subdomain);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    // Check tenant status
    if (tenant.status !== 'active') {
      res.status(403).json({ error: 'Tenant is not active' });
      return;
    }

    // Attach tenant to request
    req.tenant = tenant;

    // Add tenant context to response
    res.locals.tenant = tenant;

    next();
  } catch (error) {
    logger.error('Error in tenant middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function requireTenant(
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.tenant) {
    res.status(401).json({ error: 'Tenant context required' });
    return;
  }
  next();
}

export function checkTenantFeature(feature: string) {
  return (req: TenantRequest, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
      res.status(401).json({ error: 'Tenant context required' });
      return;
    }

    if (!req.tenant.settings.features[feature]) {
      res.status(403).json({ error: `Feature ${feature} is not enabled for this tenant` });
      return;
    }

    next();
  };
}

export function checkTenantResource(resource: string) {
  return async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.tenant) {
      res.status(401).json({ error: 'Tenant context required' });
      return;
    }

    const tenantService = TenantService.getInstance();
    const hasCapacity = await tenantService.checkResourceLimits(
      req.tenant.id,
      resource as any
    );

    if (!hasCapacity) {
      res.status(429).json({ error: `Resource limit exceeded for ${resource}` });
      return;
    }

    next();
  };
}

export function getTenantBranding(req: TenantRequest, res: Response): void {
  if (!req.tenant) {
    res.status(401).json({ error: 'Tenant context required' });
    return;
  }

  res.json(req.tenant.settings.branding);
}

export function getTenantRegionalSettings(req: TenantRequest, res: Response): void {
  if (!req.tenant) {
    res.status(401).json({ error: 'Tenant context required' });
    return;
  }

  res.json(req.tenant.settings.regional);
} 