import { z } from 'zod';

// Content Security Policy Configuration
export const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for React development
      "'unsafe-eval'", // Required for React development
      'https://cdn.jsdelivr.net',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for styled-components
      'https://fonts.googleapis.com',
    ],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: [
      "'self'",
      process.env.API_URL || 'http://localhost:3000',
      'https://api.example.com',
    ],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    workerSrc: ["'self'"],
    manifestSrc: ["'self'"],
    prefetchSrc: ["'self'"],
  },
};

// Frontend Input Validation Schemas
export const frontendValidationSchemas = {
  // User-related schemas
  user: {
    login: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(12, 'Password must be at least 12 characters'),
    }),
    registration: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
  },

  // Form-related schemas
  forms: {
    contact: z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      message: z.string().min(10, 'Message must be at least 10 characters'),
    }),
    search: z.object({
      query: z.string().min(1, 'Search query cannot be empty'),
      filters: z.record(z.string()).optional(),
    }),
  },

  // API request schemas
  api: {
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1).max(100),
    }),
    sorting: z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']),
    }),
  },
};

// XSS Protection Configuration
export const xssConfig = {
  // List of allowed HTML tags and attributes
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    a: ['href', 'title', 'target'],
  },
  // List of dangerous patterns to remove
  dangerousPatterns: [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
  ],
};

// CSRF Protection Configuration
export const csrfConfig = {
  cookieName: 'XSRF-TOKEN',
  headerName: 'X-XSRF-TOKEN',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  },
};

// Security Headers Configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': Object.entries(cspConfig.directives)
    .map(([key, value]) => `${key} ${value.join(' ')}`)
    .join('; '),
};

// Password Strength Configuration
export const passwordStrengthConfig = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90 * 24 * 60 * 60, // 90 days in seconds
  preventCommonPasswords: true,
  preventPasswordReuse: 5, // Number of previous passwords to check
};

// Session Security Configuration
export const sessionConfig = {
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  rolling: true,
  resave: false,
  saveUninitialized: false,
}; 