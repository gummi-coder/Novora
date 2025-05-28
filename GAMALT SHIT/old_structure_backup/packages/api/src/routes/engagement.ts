import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

// Get engagement metrics
router.get('/metrics', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '7d';
    const startDate = new Date();
    
    // Calculate start date based on timeRange
    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Get DAU
    const dau = await prisma.userActivity.count({
      where: {
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      distinct: ['userId'],
    });

    // Get WAU
    const wau = await prisma.userActivity.count({
      where: {
        timestamp: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      distinct: ['userId'],
    });

    // Get MAU
    const mau = await prisma.userActivity.count({
      where: {
        timestamp: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      distinct: ['userId'],
    });

    // Calculate stickiness ratio
    const stickinessRatio = (dau / mau) * 100;

    // Get historical data for sparklines
    const historicalData = await prisma.userActivity.groupBy({
      by: ['timestamp'],
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      _count: {
        userId: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    const metrics = [
      {
        id: 'm1',
        name: 'Daily Active Users',
        value: dau,
        change: 12.5, // TODO: Calculate actual change
        trend: 'up',
        sparkline: historicalData.map(d => d._count.userId),
      },
      {
        id: 'm2',
        name: 'Weekly Active Users',
        value: wau,
        change: 8.3,
        trend: 'up',
        sparkline: historicalData.map(d => d._count.userId),
      },
      {
        id: 'm3',
        name: 'Monthly Active Users',
        value: mau,
        change: 5.7,
        trend: 'up',
        sparkline: historicalData.map(d => d._count.userId),
      },
      {
        id: 'm4',
        name: 'Stickiness Ratio',
        value: stickinessRatio,
        change: 2.1,
        trend: 'up',
        sparkline: historicalData.map(d => (d._count.userId / mau) * 100),
      },
    ];

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get feature usage data
router.get('/feature-usage', async (req, res) => {
  try {
    const featureUsage = await prisma.featureUsage.groupBy({
      by: ['featureName'],
      _count: {
        userId: true,
      },
      where: {
        timestamp: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    const totalUsers = await prisma.user.count();

    const formattedData = featureUsage.map(feature => ({
      name: feature.featureName,
      usage: (feature._count.userId / totalUsers) * 100,
      change: 0, // TODO: Calculate actual change
      trend: 'up',
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching feature usage:', error);
    res.status(500).json({ error: 'Failed to fetch feature usage' });
  }
});

// Get cohort analysis data
router.get('/cohort-analysis', async (req, res) => {
  try {
    const cohorts = await prisma.user.groupBy({
      by: ['cohort'],
      _count: {
        id: true,
      },
      orderBy: {
        cohort: 'asc',
      },
    });

    const retentionData = await prisma.userActivity.groupBy({
      by: ['userId', 'timestamp'],
      where: {
        timestamp: {
          gte: new Date(new Date().setDate(new Date().getDate() - 90)),
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Process retention data
    const cohortAnalysis = cohorts.map(cohort => {
      const weeks = Array(7).fill(0).map((_, i) => {
        const weekStart = new Date(cohort.cohort);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const activeUsers = retentionData.filter(activity => 
          activity.timestamp >= weekStart && 
          activity.timestamp < weekEnd
        ).length;

        return (activeUsers / cohort._count.id) * 100;
      });

      return {
        cohort: cohort.cohort,
        size: cohort._count.id,
        retention: weeks,
      };
    });

    res.json(cohortAnalysis);
  } catch (error) {
    console.error('Error fetching cohort analysis:', error);
    res.status(500).json({ error: 'Failed to fetch cohort analysis' });
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const activities = await prisma.userActivity.findMany({
      take: 10,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      user: activity.user.email,
      action: activity.action,
      timestamp: activity.timestamp,
      details: activity.details,
    }));

    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

export default router; 