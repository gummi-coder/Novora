import { z } from 'zod';

// Session Types
export const SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  refreshToken: z.string(),
  deviceInfo: z.object({
    name: z.string(),
    type: z.enum(['desktop', 'mobile', 'tablet', 'other']),
    browser: z.string(),
    os: z.string(),
    ip: z.string().ip(),
    location: z.object({
      country: z.string(),
      city: z.string(),
      timezone: z.string(),
    }).optional(),
  }),
  status: z.enum(['active', 'expired', 'revoked']),
  lastActivity: z.date(),
  expiresAt: z.date(),
  createdAt: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export type Session = z.infer<typeof SessionSchema>;

// Session Configuration
export const SessionConfigSchema = z.object({
  maxConcurrentSessions: z.number().min(1).default(5),
  sessionLifespan: z.number().min(300).default(3600), // in seconds
  refreshTokenLifespan: z.number().min(3600).default(2592000), // 30 days in seconds
  inactivityTimeout: z.number().min(60).default(1800), // 30 minutes in seconds
  requireDeviceVerification: z.boolean().default(false),
  allowedOrigins: z.array(z.string()),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;

// Session Events
export const SessionEventSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.enum(['login', 'logout', 'refresh', 'expire', 'revoke']),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export type SessionEvent = z.infer<typeof SessionEventSchema>;

// Session Management API Types
export const SessionManagementRequestSchema = z.object({
  action: z.enum(['list', 'revoke', 'revokeAll']),
  sessionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

export type SessionManagementRequest = z.infer<typeof SessionManagementRequestSchema>;

// Session Response Types
export const SessionResponseSchema = z.object({
  success: z.boolean(),
  data: z.union([
    SessionSchema,
    z.array(SessionSchema),
    z.object({
      message: z.string(),
      affectedSessions: z.number(),
    }),
  ]),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }).optional(),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>; 