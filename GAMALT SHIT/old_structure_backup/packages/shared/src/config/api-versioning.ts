import { z } from 'zod';

// API versioning configuration schema
export const apiVersioningConfigSchema = z.object({
  // Versioning strategy
  strategy: z.enum(['url', 'header', 'subdomain']).default('url'),
  
  // Default version
  defaultVersion: z.string().regex(/^v\d+$/).default('v1'),
  
  // Version lifecycle settings
  deprecationPeriod: z.number().default(180), // Days before sunset
  sunsetPeriod: z.number().default(90), // Days after deprecation
  
  // Documentation settings
  enableVersionDocs: z.boolean().default(true),
  docsPath: z.string().default('/docs'),
  
  // Response headers
  versionHeader: z.string().default('X-API-Version'),
  deprecatedHeader: z.string().default('X-API-Deprecated'),
  sunsetHeader: z.string().default('X-API-Sunset'),
  
  // Version-specific settings
  versions: z.record(z.object({
    status: z.enum(['active', 'deprecated', 'sunset']),
    description: z.string(),
    breakingChanges: z.array(z.string()).optional(),
    deprecatedDate: z.date().optional(),
    sunsetDate: z.date().optional(),
  })),
});

export type ApiVersioningConfig = z.infer<typeof apiVersioningConfigSchema>;

// Default configuration
export const defaultApiVersioningConfig: ApiVersioningConfig = {
  strategy: 'url',
  defaultVersion: 'v1',
  deprecationPeriod: 180,
  sunsetPeriod: 90,
  enableVersionDocs: true,
  docsPath: '/docs',
  versionHeader: 'X-API-Version',
  deprecatedHeader: 'X-API-Deprecated',
  sunsetHeader: 'X-API-Sunset',
  versions: {
    'v1': {
      status: 'active',
      description: 'Initial API version',
    },
    'v2': {
      status: 'active',
      description: 'Latest API version with improved features',
    },
  },
};

// Validate and transform environment variables
export function validateApiVersioningConfig(): ApiVersioningConfig {
  try {
    const envConfig = {
      strategy: process.env.API_VERSION_STRATEGY,
      defaultVersion: process.env.API_DEFAULT_VERSION,
      deprecationPeriod: process.env.API_DEPRECATION_PERIOD,
      sunsetPeriod: process.env.API_SUNSET_PERIOD,
      enableVersionDocs: process.env.API_ENABLE_VERSION_DOCS === 'true',
      docsPath: process.env.API_DOCS_PATH,
      versionHeader: process.env.API_VERSION_HEADER,
      deprecatedHeader: process.env.API_DEPRECATED_HEADER,
      sunsetHeader: process.env.API_SUNSET_HEADER,
      versions: defaultApiVersioningConfig.versions, // Use default versions
    };

    return apiVersioningConfigSchema.parse(envConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Invalid API versioning configuration: ${missingVars}`);
    }
    throw error;
  }
} 