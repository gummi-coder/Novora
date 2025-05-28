import { z } from 'zod';

// Compliance configuration schema
export const ComplianceConfigSchema = z.object({
  // Data retention settings
  dataRetention: z.object({
    enabled: z.boolean(),
    defaultPeriod: z.number(), // in days
    dataTypes: z.record(z.object({
      retentionPeriod: z.number(),
      retentionReason: z.string(),
      autoDelete: z.boolean()
    }))
  }),

  // Privacy policy settings
  privacyPolicy: z.object({
    requireConsent: z.boolean(),
    consentTypes: z.array(z.enum(['explicit', 'implicit'])),
    versioning: z.object({
      enabled: z.boolean(),
      requireReconsent: z.boolean(),
      reconsentThreshold: z.number() // days
    })
  }),

  // Audit logging settings
  auditLogging: z.object({
    enabled: z.boolean(),
    retentionPeriod: z.number(), // in days
    logLevels: z.array(z.enum(['info', 'warn', 'error'])),
    sensitiveActions: z.array(z.string()),
    excludePaths: z.array(z.string())
  }),

  // GDPR settings
  gdpr: z.object({
    enabled: z.boolean(),
    dataSubjectRequestTimeout: z.number(), // in days
    dataPortabilityFormat: z.array(z.string()),
    dataDeletionGracePeriod: z.number() // in days
  }),

  // Security settings
  security: z.object({
    encryption: z.object({
      enabled: z.boolean(),
      algorithm: z.string(),
      keyRotationPeriod: z.number() // in days
    }),
    accessControl: z.object({
      requireMfa: z.boolean(),
      sessionTimeout: z.number(), // in minutes
      maxLoginAttempts: z.number()
    })
  })
});

export type ComplianceConfig = z.infer<typeof ComplianceConfigSchema>;

// Default compliance configuration
export const defaultComplianceConfig: ComplianceConfig = {
  dataRetention: {
    enabled: true,
    defaultPeriod: 365, // 1 year
    dataTypes: {
      userProfile: {
        retentionPeriod: 365,
        retentionReason: 'User account management',
        autoDelete: false
      },
      surveyResponses: {
        retentionPeriod: 730, // 2 years
        retentionReason: 'Survey analysis and reporting',
        autoDelete: true
      },
      auditLogs: {
        retentionPeriod: 1095, // 3 years
        retentionReason: 'Compliance and security auditing',
        autoDelete: true
      },
      analyticsData: {
        retentionPeriod: 180, // 6 months
        retentionReason: 'Service improvement',
        autoDelete: true
      }
    }
  },

  privacyPolicy: {
    requireConsent: true,
    consentTypes: ['explicit'],
    versioning: {
      enabled: true,
      requireReconsent: true,
      reconsentThreshold: 180 // 6 months
    }
  },

  auditLogging: {
    enabled: true,
    retentionPeriod: 1095, // 3 years
    logLevels: ['info', 'warn', 'error'],
    sensitiveActions: [
      'user.login',
      'user.logout',
      'user.password_change',
      'user.consent_change',
      'data.export',
      'data.delete',
      'policy.update',
      'settings.update'
    ],
    excludePaths: [
      '/health',
      '/metrics',
      '/static'
    ]
  },

  gdpr: {
    enabled: true,
    dataSubjectRequestTimeout: 30, // 30 days
    dataPortabilityFormat: ['json', 'csv'],
    dataDeletionGracePeriod: 7 // 7 days
  },

  security: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyRotationPeriod: 90 // 90 days
    },
    accessControl: {
      requireMfa: true,
      sessionTimeout: 30, // 30 minutes
      maxLoginAttempts: 5
    }
  }
};

// Validate compliance configuration
export function validateComplianceConfig(config: Partial<ComplianceConfig>): ComplianceConfig {
  try {
    return ComplianceConfigSchema.parse({
      ...defaultComplianceConfig,
      ...config
    });
  } catch (error) {
    throw new Error(`Invalid compliance configuration: ${error}`);
  }
}

// Get compliance configuration from environment variables
export function getComplianceConfig(): ComplianceConfig {
  const config: Partial<ComplianceConfig> = {
    dataRetention: {
      enabled: process.env.DATA_RETENTION_ENABLED === 'true',
      defaultPeriod: parseInt(process.env.DATA_RETENTION_PERIOD || '365', 10),
      dataTypes: {
        userProfile: {
          retentionPeriod: parseInt(process.env.USER_PROFILE_RETENTION || '365', 10),
          retentionReason: 'User account management',
          autoDelete: false
        },
        surveyResponses: {
          retentionPeriod: parseInt(process.env.SURVEY_RESPONSES_RETENTION || '730', 10),
          retentionReason: 'Survey analysis and reporting',
          autoDelete: true
        },
        auditLogs: {
          retentionPeriod: parseInt(process.env.AUDIT_LOGS_RETENTION || '1095', 10),
          retentionReason: 'Compliance and security auditing',
          autoDelete: true
        },
        analyticsData: {
          retentionPeriod: parseInt(process.env.ANALYTICS_RETENTION || '180', 10),
          retentionReason: 'Service improvement',
          autoDelete: true
        }
      }
    },
    privacyPolicy: {
      requireConsent: process.env.PRIVACY_POLICY_REQUIRE_CONSENT === 'true',
      consentTypes: ['explicit'],
      versioning: {
        enabled: true,
        requireReconsent: true,
        reconsentThreshold: 180
      }
    },
    auditLogging: {
      enabled: process.env.AUDIT_LOGGING_ENABLED === 'true',
      retentionPeriod: parseInt(process.env.AUDIT_LOGGING_RETENTION || '1095', 10),
      logLevels: ['info', 'warn', 'error'],
      sensitiveActions: [
        'user.login',
        'user.logout',
        'user.password_change',
        'user.consent_change',
        'data.export',
        'data.delete',
        'policy.update',
        'settings.update'
      ],
      excludePaths: [
        '/health',
        '/metrics',
        '/static'
      ]
    },
    gdpr: {
      enabled: process.env.GDPR_ENABLED === 'true',
      dataSubjectRequestTimeout: parseInt(process.env.GDPR_REQUEST_TIMEOUT || '30', 10),
      dataPortabilityFormat: ['json', 'csv'],
      dataDeletionGracePeriod: 7
    },
    security: {
      encryption: {
        enabled: process.env.ENCRYPTION_ENABLED === 'true',
        algorithm: 'aes-256-gcm',
        keyRotationPeriod: 90
      },
      accessControl: {
        requireMfa: process.env.REQUIRE_MFA === 'true',
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '30', 10),
        maxLoginAttempts: 5
      }
    }
  };

  return validateComplianceConfig(config);
} 