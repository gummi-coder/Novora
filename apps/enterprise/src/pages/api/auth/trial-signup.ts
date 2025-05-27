import { NextApiRequest, NextApiResponse } from 'next';
import { sendWelcomeEmail } from '@/lib/email';
import { logAnalytics } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { RateLimiter } from '@/infrastructure/rateLimiter';

// Initialize rate limiter
const rateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 requests per hour
  blockDuration: 24 * 60 * 60 * 1000, // 24 hours block
});

// Validation schema for trial signup
const trialSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company name is required'),
  companySize: z.string().min(1, 'Company size is required'),
  role: z.string().min(1, 'Role is required'),
  plan: z.string().min(1, 'Plan is required'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get client IP or use a fallback
  const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // Check rate limit
  if (rateLimiter.isRateLimited(identifier as string)) {
    const info = rateLimiter.getRateLimitInfo(identifier as string);
    return res.status(429).json({
      message: 'Too many requests',
      retryAfter: info?.blockedUntil ? Math.ceil((info.blockedUntil - Date.now()) / 1000) : 3600,
    });
  }

  try {
    // Validate request body
    const validatedData = trialSignupSchema.parse(req.body);

    // Create trial user in database
    const trialUser = await prisma.trialUser.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        company: validatedData.company,
        companySize: validatedData.companySize,
        role: validatedData.role,
        plan: validatedData.plan,
        status: 'ACTIVE',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    });

    // Log analytics
    await logAnalytics('trial_signup', {
      userId: trialUser.id,
      plan: validatedData.plan,
      companySize: validatedData.companySize,
    });

    // Send welcome email
    await sendWelcomeEmail({
      to: validatedData.email,
      firstName: validatedData.firstName,
      plan: validatedData.plan,
    });

    // Send admin notification
    await sendAdminNotification({
      type: 'NEW_TRIAL',
      user: trialUser,
    });

    return res.status(200).json({
      message: 'Trial signup successful',
      user: {
        id: trialUser.id,
        email: trialUser.email,
        trialEndsAt: trialUser.trialEndsAt,
      },
    });
  } catch (error) {
    console.error('Trial signup error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
} 