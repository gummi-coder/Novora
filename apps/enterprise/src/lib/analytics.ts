import { prisma } from './prisma';

interface AnalyticsEvent {
  type: string;
  properties: Record<string, any>;
  userId?: string;
}

export async function logAnalytics(eventType: string, properties: Record<string, any>) {
  try {
    // Log to database
    await prisma.analyticsEvent.create({
      data: {
        type: eventType,
        properties: properties,
        userId: properties.userId,
        timestamp: new Date(),
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', {
        type: eventType,
        properties,
        timestamp: new Date().toISOString(),
      });
    }

    // You can add additional analytics providers here
    // For example: Mixpanel, Google Analytics, etc.
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
}

// Helper function to get trial conversion rate
export async function getTrialConversionRate(startDate: Date, endDate: Date) {
  const trials = await prisma.trialUser.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const conversions = await prisma.trialUser.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'CONVERTED',
    },
  });

  return trials > 0 ? (conversions / trials) * 100 : 0;
}

// Helper function to get trial signups by plan
export async function getTrialSignupsByPlan(startDate: Date, endDate: Date) {
  const signups = await prisma.trialUser.groupBy({
    by: ['plan'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  return signups.map(({ plan, _count }) => ({
    plan,
    count: _count.id,
  }));
}

// Helper function to get trial signups by company size
export async function getTrialSignupsByCompanySize(startDate: Date, endDate: Date) {
  const signups = await prisma.trialUser.groupBy({
    by: ['companySize'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  return signups.map(({ companySize, _count }) => ({
    companySize,
    count: _count.id,
  }));
} 