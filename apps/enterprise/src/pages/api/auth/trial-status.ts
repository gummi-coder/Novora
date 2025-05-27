import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const trialUser = await prisma.trialUser.findUnique({
      where: { email: session.user.email },
    });

    if (!trialUser) {
      return res.status(404).json({ message: 'Trial user not found' });
    }

    const now = new Date();
    const trialEndsAt = new Date(trialUser.trialEndsAt);
    const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Update last login
    await prisma.trialUser.update({
      where: { id: trialUser.id },
      data: {
        lastLoginAt: now,
        loginCount: { increment: 1 },
      },
    });

    // Check if trial has expired
    if (now > trialEndsAt && trialUser.status === 'ACTIVE') {
      await prisma.trialUser.update({
        where: { id: trialUser.id },
        data: {
          status: 'EXPIRED',
          expiredAt: now,
        },
      });

      return res.status(200).json({
        isActive: false,
        status: 'EXPIRED',
        daysRemaining: 0,
      });
    }

    return res.status(200).json({
      isActive: trialUser.status === 'ACTIVE',
      status: trialUser.status,
      daysRemaining: Math.max(0, daysRemaining),
    });
  } catch (error) {
    console.error('Trial status check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 