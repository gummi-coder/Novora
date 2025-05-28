import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createVersionRouter, versionMiddleware } from './services/api-versioning';
import { validateApiVersioningConfig } from './config/api-versioning';

// Version schema
export const VersionSchema = z.object({
  version: z.string().regex(/^v\d+$/),
  status: z.enum(['active', 'deprecated', 'sunset']),
  sunsetDate: z.date().optional(),
  deprecatedDate: z.date().optional(),
  description: z.string(),
  breakingChanges: z.array(z.string()).optional(),
});

export type Version = z.infer<typeof VersionSchema>;

// Version configuration
const VERSIONS: Record<string, Version> = {
  'v1': {
    version: 'v1',
    status: 'active',
    description: 'Initial API version',
  },
  'v2': {
    version: 'v2',
    status: 'active',
    description: 'Latest API version with improved features',
  },
};

// Version middleware
export function versionMiddleware(versions: Record<string, Version>) {
  return async (request: any, reply: any) => {
    const version = request.headers['x-api-version'] || 'v1';
    
    if (!versions[version]) {
      return reply.status(400).send({
        error: 'Invalid API version',
        message: `Version ${version} is not supported`,
        supportedVersions: Object.keys(versions),
      });
    }

    const versionInfo = versions[version];
    
    if (versionInfo.status === 'sunset') {
      return reply.status(410).send({
        error: 'API version sunset',
        message: `Version ${version} has been sunset`,
        sunsetDate: versionInfo.sunsetDate,
      });
    }

    if (versionInfo.status === 'deprecated') {
      reply.header('X-API-Deprecated', 'true');
      reply.header('X-API-Deprecated-Date', versionInfo.deprecatedDate);
      reply.header('X-API-Sunset-Date', versionInfo.sunsetDate);
    }

    request.version = version;
    request.versionInfo = versionInfo;
  };
}

// Version router
export function createVersionRouter(app: FastifyInstance, versions: Record<string, Version>) {
  // Version info endpoint
  app.get('/api/versions', async (request, reply) => {
    return {
      versions: Object.values(versions),
      current: Object.values(versions).find(v => v.status === 'active')?.version,
    };
  });

  // Version-specific routes
  Object.entries(versions).forEach(([version, info]) => {
    const router = app.register(async (fastify) => {
      // Add version prefix to all routes
      fastify.addHook('onRequest', async (request, reply) => {
        request.url = `/${version}${request.url}`;
      });

      // Add version info to response headers
      fastify.addHook('onSend', async (request, reply) => {
        reply.header('X-API-Version', version);
        if (info.status === 'deprecated') {
          reply.header('X-API-Deprecated', 'true');
          reply.header('X-API-Deprecated-Date', info.deprecatedDate);
          reply.header('X-API-Sunset-Date', info.sunsetDate);
        }
      });
    }, { prefix: `/${version}` });

    // Add version-specific documentation
    app.register(require('@fastify/swagger'), {
      routePrefix: `/${version}/docs`,
      swagger: {
        info: {
          title: `API Documentation - ${version}`,
          description: info.description,
          version: version,
        },
        tags: [
          { name: 'version', description: 'Version information' },
          { name: 'deprecated', description: 'Deprecated endpoints' },
        ],
      },
      exposeRoute: true,
    });
  });
}

// Version deprecation helper
export function deprecateVersion(version: string, sunsetDate: Date) {
  const versionInfo = VERSIONS[version];
  if (!versionInfo) {
    throw new Error(`Version ${version} not found`);
  }

  versionInfo.status = 'deprecated';
  versionInfo.deprecatedDate = new Date();
  versionInfo.sunsetDate = sunsetDate;
}

// Version sunset helper
export function sunsetVersion(version: string) {
  const versionInfo = VERSIONS[version];
  if (!versionInfo) {
    throw new Error(`Version ${version} not found`);
  }

  versionInfo.status = 'sunset';
  versionInfo.sunsetDate = new Date();
}

// Export version configuration
export const apiVersions = VERSIONS;

const config = validateApiVersioningConfig();
const app = FastifyInstance;
app.use(versionMiddleware(config.versions));
createVersionRouter(app, config.versions);

// v1 routes
app.get('/v1/users', ...);
app.post('/v1/users', ...);

// v2 routes
app.get('/v2/users', ...);
app.post('/v2/users', ...); 